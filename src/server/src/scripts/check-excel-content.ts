import * as XLSX from 'xlsx'
import * as path from 'path'

const checkExcelContent = async () => {
  try {
    // Excel 파일 경로
    const excelPath = path.join(__dirname, '../../data/Users2.xlsx')
    console.log('📄 Excel 파일 읽기:', excelPath)
    
    // Excel 파일 읽기
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`📊 총 ${data.length}개의 행 발견\n`)
    
    console.log('📋 Excel 파일 내용:')
    console.log('='.repeat(80))
    
    // 헤더 출력
    if (data.length > 0) {
      const headers = Object.keys(data[0] as any)
      console.log('컬럼:', headers.join(', '))
      console.log('-'.repeat(80))
    }
    
    // 모든 데이터 출력
    data.forEach((row, index) => {
      console.log(`${index + 1}:`, JSON.stringify(row, null, 2))
    })
    
    console.log('\n' + '='.repeat(80))
    
    // 계정 필드만 추출
    console.log('\n🔍 계정 정보만 추출:')
    data.forEach((row, index) => {
      const account = (row as any)['계정'] || (row as any)['account'] || (row as any)['Account']
      console.log(`${index + 1}. 계정: ${account}`)
    })
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

// 스크립트 실행
checkExcelContent()