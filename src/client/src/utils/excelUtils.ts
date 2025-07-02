import * as XLSX from 'xlsx'
import type { Partner } from '../types/partner.types'

// 거래처 데이터를 엑셀 형식으로 변환
export const exportPartnersToExcel = (partners: Partner[], filename: string = '거래처목록') => {
  try {
    // 엑셀로 내보낼 데이터 구조 정의
    const excelData = partners.map(partner => ({
      '거래처코드': partner.partnerCode || '',
      '거래처명': partner.partnerName || '',
      '간판명': partner.signboardName || '',
      '영업소명': partner.officeName || '',
      '영업소코드': partner.officeCode || '',
      '채널': partner.channel || '',
      '거래처등급': partner.partnerGrade || '',
      '관리등급': partner.managementGrade || '',
      '사업자등록번호': partner.businessNumber || '',
      '대표자명': partner.ownerName || '',
      '우편번호': partner.postalCode || '',
      '사업장주소': partner.businessAddress || '',
      '현재담당자사번': partner.currentManagerEmployeeId || '',
      '현재담당자명': partner.currentManagerName || '',
      '이전담당자사번': partner.previousManagerEmployeeId || '',
      '이전담당자명': partner.previousManagerName || '',
      '담당자변경일': partner.managerChangedDate ? formatDate(partner.managerChangedDate) : '',
      '담당자변경사유': partner.managerChangeReason || '',
      '위도': partner.latitude || '',
      '경도': partner.longitude || '',
      '활성상태': partner.isActive ? '활성' : '비활성',
      '생성일': partner.createdAt ? formatDate(partner.createdAt) : '',
      '수정일': partner.updatedAt ? formatDate(partner.updatedAt) : ''
    }))

    // 워크북 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '거래처목록')

    // 컬럼 너비 자동 조정
    const columnWidths = Object.keys(excelData[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key as keyof typeof row]).length)
      )
      return { wch: Math.min(maxLength + 2, 30) } // 최대 30자로 제한
    })
    worksheet['!cols'] = columnWidths

    // 파일명에 현재 날짜 추가
    const currentDate = new Date().toISOString().split('T')[0]
    const finalFilename = `${filename}_${currentDate}.xlsx`

    // 파일 다운로드
    XLSX.writeFile(workbook, finalFilename)

    return {
      success: true,
      filename: finalFilename,
      count: partners.length
    }
  } catch (error) {
    console.error('엑셀 파일 생성 실패:', error)
    return {
      success: false,
      error: '엑셀 파일 생성 중 오류가 발생했습니다.'
    }
  }
}

// 검색 조건을 포함한 엑셀 다운로드
export const exportFilteredPartnersToExcel = (
  partners: Partner[], 
  filters: {
    searchTerm?: string
    channel?: string
    grade?: string
    managerChangeDate?: string
    managerFilter?: string
    branchFilter?: string
    officeFilter?: string
  },
  filename: string = '거래처목록'
) => {
  // 필터링된 데이터
  let filteredPartners = partners

  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filteredPartners = filteredPartners.filter(partner =>
      partner.partnerName?.toLowerCase().includes(searchLower) ||
      partner.signboardName?.toLowerCase().includes(searchLower) ||
      partner.businessAddress?.toLowerCase().includes(searchLower) ||
      partner.ownerName?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.channel) {
    filteredPartners = filteredPartners.filter(partner => partner.channel === filters.channel)
  }

  if (filters.grade) {
    filteredPartners = filteredPartners.filter(partner => partner.partnerGrade === filters.grade)
  }

  // 담당자 필터링
  if (filters.managerFilter) {
    filteredPartners = filteredPartners.filter(partner => partner.currentManagerEmployeeId === filters.managerFilter)
  }

  // 담당자변경일 필터링 (정확한 날짜 매칭)
  if (filters.managerChangeDate) {
    filteredPartners = filteredPartners.filter(partner => {
      if (!partner.managerChangedDate) return false
      
      const changeDate = new Date(partner.managerChangedDate)
      const filterDate = new Date(filters.managerChangeDate!)
      
      // 날짜만 비교 (시간 제외)
      return changeDate.toDateString() === filterDate.toDateString()
    })
  }

  // 지사 필터링 (클라이언트 측에서는 거래처의 영업소명 기반으로 필터링)
  if (filters.branchFilter) {
    filteredPartners = filteredPartners.filter(partner => {
      // officeName에서 지사명을 추출하거나 별도 필드가 있다면 사용
      return partner.officeName?.includes(filters.branchFilter!)
    })
  }

  // 지점 필터링
  if (filters.officeFilter) {
    filteredPartners = filteredPartners.filter(partner => partner.officeName === filters.officeFilter)
  }

  // 필터 조건을 파일명에 포함
  let filterSuffix = ''
  if (filters.searchTerm) filterSuffix += `_검색(${filters.searchTerm})`
  if (filters.channel) filterSuffix += `_채널(${filters.channel})`
  if (filters.grade) filterSuffix += `_등급(${filters.grade})`
  if (filters.managerFilter) filterSuffix += `_담당자(${filters.managerFilter})`
  if (filters.managerChangeDate) filterSuffix += `_변경일(${filters.managerChangeDate})`
  if (filters.branchFilter) filterSuffix += `_지사(${filters.branchFilter})`
  if (filters.officeFilter) filterSuffix += `_지점(${filters.officeFilter})`

  const finalFilename = `${filename}${filterSuffix}`

  return exportPartnersToExcel(filteredPartners, finalFilename)
}

// Excel 파일에서 거래처 데이터 읽기 (전체 교체용)
export const readPartnersFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 첫 번째 시트 읽기
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // JSON 변환
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          reject(new Error('Excel 파일에 데이터가 없거나 헤더만 있습니다.'))
          return
        }
        
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]
        
        // 디버깅: 헤더 정보 출력
        console.log('📋 Excel 파일 헤더 정보:', headers)
        console.log('📊 데이터 행 수:', rows.length)
        
        // 파트너 데이터로 변환
        const partners = rows
          .filter(row => row.length > 0 && row[0]) // 빈 행 제외
          .map((row, index) => {
            try {
              const partner: any = {}
              
              headers.forEach((header, colIndex) => {
                const value = row[colIndex]
                const headerTrimmed = header?.trim() || ''
                
                // 헤더명을 영문 필드명으로 매핑 (더 유연한 매핑)
                switch (headerTrimmed) {
                  // 거래처코드 (다양한 변형 지원)
                  case '거래처코드':
                  case '거래처 코드':
                  case '업체코드':
                  case '업체 코드':
                  case 'PARTNER_CODE':
                  case 'partnerCode':
                    partner.partnerCode = String(value || '').trim()
                    break
                    
                  // 거래처명/간판명 (둘 다 거래처명으로 처리)
                  case '거래처명':
                  case '거래처 명':
                  case '업체명':
                  case '업체 명':
                  case '간판명':
                  case '간판 명':
                  case 'PARTNER_NAME':
                  case 'partnerName':
                  case 'SIGNBOARD_NAME':
                  case 'signboardName':
                    // 거래처명이 없으면 간판명을 거래처명으로 사용
                    if (!partner.partnerName) {
                      partner.partnerName = String(value || '').trim()
                    }
                    if (headerTrimmed.includes('간판')) {
                      partner.signboardName = String(value || '').trim()
                    }
                    break
                  case '영업소명':
                    partner.officeName = String(value || '').trim()
                    break
                  case '영업소코드':
                    partner.officeCode = String(value || '').trim()
                    break
                  case '채널':
                    partner.channel = String(value || '').trim()
                    break
                  case 'RTM채널':
                    partner.rtmChannel = String(value || '').trim()
                    break
                  case '거래처등급':
                    partner.partnerGrade = String(value || '').trim()
                    break
                  case '관리등급':
                    partner.managementGrade = String(value || '').trim()
                    break
                  case '사업자등록번호':
                    partner.businessNumber = String(value || '').trim()
                    break
                  case '대표자명':
                    partner.ownerName = String(value || '').trim()
                    break
                  case '우편번호':
                    partner.postalCode = String(value || '').trim()
                    break
                  case '사업장주소':
                    partner.businessAddress = String(value || '').trim()
                    break
                  case '현재담당자사번':
                  case '현재 담당자사번':
                  case '현재 담당 사번':
                  case '담당자사번':
                  case '사번':
                    partner.currentManagerEmployeeId = String(value || '').trim()
                    break
                  case '현재담당자명':
                  case '현재 담당자명':
                  case '현재 담당 영업사원':
                  case '담당자명':
                  case '담당자':
                    partner.currentManagerName = String(value || '').trim()
                    break
                  case '이전담당자사번':
                    partner.previousManagerEmployeeId = String(value || '').trim()
                    break
                  case '이전담당자명':
                    partner.previousManagerName = String(value || '').trim()
                    break
                  case '담당자변경일':
                    if (value) {
                      partner.managerChangedDate = parseExcelDate(value)
                    }
                    break
                  case '담당자변경사유':
                    partner.managerChangeReason = String(value || '').trim()
                    break
                  case '위도':
                    if (value) {
                      const lat = Number(value)
                      if (!isNaN(lat)) partner.latitude = lat
                    }
                    break
                  case '경도':
                    if (value) {
                      const lng = Number(value)
                      if (!isNaN(lng)) partner.longitude = lng
                    }
                    break
                }
              })
              
              // 디버깅: 첫 번째 행의 데이터 구조 출력
              if (index === 0) {
                console.log('🔍 첫 번째 데이터 행 원본:', row)
                console.log('🔍 파싱된 파트너 데이터:', partner)
              }
              
              // 필수 필드 검증 (더 상세한 오류 메시지)
              const missingFields = []
              if (!partner.partnerCode) missingFields.push('거래처코드')
              if (!partner.partnerName) missingFields.push('거래처명')
              if (!partner.currentManagerEmployeeId) missingFields.push('현재담당자사번')
              if (!partner.currentManagerName) missingFields.push('현재담당자명')
              
              if (missingFields.length > 0) {
                console.error(`❌ 행 ${index + 2} 오류:`, {
                  '누락된 필드': missingFields,
                  '원본 데이터': row,
                  '파싱된 데이터': partner,
                  '헤더': headers
                })
                throw new Error(`행 ${index + 2}: 필수 필드가 누락되었습니다 - ${missingFields.join(', ')}`)
              }
              
              return partner
            } catch (error) {
              throw new Error(`행 ${index + 2}: ${error instanceof Error ? error.message : '데이터 변환 오류'}`)
            }
          })
        
        console.log(`📤 Excel 파일에서 ${partners.length}개 거래처 데이터 읽기 완료`)
        resolve(partners)
      } catch (error) {
        console.error('Excel 파일 읽기 오류:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsArrayBuffer(file)
  })
}

// Excel 날짜 파싱 함수
const parseExcelDate = (value: any): string | undefined => {
  if (!value) return undefined
  
  try {
    // Excel 날짜는 숫자로 저장되는 경우가 많음
    if (typeof value === 'number') {
      // Excel epoch (1900-01-01)부터의 일수를 JavaScript Date로 변환
      const excelEpoch = new Date(1900, 0, 1)
      const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0] // YYYY-MM-DD 형식
    }
    
    // 문자열인 경우 직접 파싱
    if (typeof value === 'string') {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
    }
    
    return undefined
  } catch {
    return undefined
  }
}

// 날짜 포맷팅 함수
const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return ''
  }
}

// 엑셀 템플릿 다운로드 (거래처 등록용)
export const downloadPartnerTemplate = () => {
  try {
    const templateData = [{
      '거래처코드': 'P001',
      '거래처명': '샘플거래처',
      '간판명': '샘플간판',
      '영업소명': '서울영업소',
      '영업소코드': 'S001',
      '채널': '업소',
      '거래처등급': 'A',
      '관리등급': '1',
      '사업자등록번호': '123-45-67890',
      '대표자명': '홍길동',
      '우편번호': '12345',
      '사업장주소': '서울시 강남구 테헤란로 123',
      '현재담당자사번': 'E001',
      '현재담당자명': '김담당',
      '이전담당자사번': '',
      '이전담당자명': '',
      '담당자변경일': '',
      '담당자변경사유': '',
      '위도': '37.5665',
      '경도': '126.9780'
    }]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    
    XLSX.utils.book_append_sheet(workbook, worksheet, '거래처템플릿')

    // 컬럼 너비 설정
    const columnWidths = Object.keys(templateData[0]).map(() => ({ wch: 15 }))
    worksheet['!cols'] = columnWidths

    XLSX.writeFile(workbook, '거래처등록템플릿.xlsx')

    return { success: true, filename: '거래처등록템플릿.xlsx' }
  } catch (error) {
    console.error('템플릿 다운로드 실패:', error)
    return { success: false, error: '템플릿 다운로드 중 오류가 발생했습니다.' }
  }
}