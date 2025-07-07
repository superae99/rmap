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
    return { success: false, error: '템플릿 다운로드 중 오류가 발생했습니다.' }
  }
}