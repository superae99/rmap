require('dotenv').config();
const { createConnection } = require('typeorm');

async function checkManagers() {
  try {
    const connection = await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'kakao_map_db',
      synchronize: false,
      logging: false,
      entities: ['dist/models/*.js']
    });

    const result = await connection.query(`
      SELECT employeeId, employeeName, branchName, officeName, position, jobTitle 
      FROM users 
      WHERE isActive = 1 
      AND (position NOT LIKE '%지점장%' AND jobTitle NOT LIKE '%지점장%')
      LIMIT 10
    `);

    console.log('📊 담당자 데이터 샘플:');
    console.table(result);

    await connection.close();
  } catch (error) {
    console.error('❌ 에러:', error.message);
  }
}

checkManagers();