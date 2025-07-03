const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(__dirname, '../../data/Users2.xlsx'));
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('전체 사용자 목록:');
data.forEach((row, index) => {
  if (row['계정'] && row['계정'] !== 'hyeongraekim') {
    console.log(`${index + 1}. ${row['성명']} (${row['계정']}) - ${row['본부']} ${row['부문']} ${row['직급']} ${row['직책']}`);
  }
});

console.log('\n총 ' + data.filter(row => row['계정'] && row['계정'] !== 'hyeongraekim').length + '명');