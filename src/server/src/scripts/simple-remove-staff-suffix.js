const mysql = require('mysql2/promise');

const removeStaffSuffix = async () => {
  let connection;
  
  try {
    // Platform.sh 환경변수에서 데이터베이스 정보 가져오기
    const relationships = JSON.parse(process.env.PLATFORM_RELATIONSHIPS || '{}');
    const dbConfig = relationships.database?.[0];
    
    if (!dbConfig) {
      throw new Error('Database configuration not found');
    }
    
    console.log('🔍 데이터베이스 연결 중...');
    
    // MySQL 연결
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.path
    });
    
    console.log('✅ 데이터베이스 연결 성공\n');
    
    // (스탭권한) 텍스트가 포함된 사용자 조회
    console.log('🔍 (스탭권한) 텍스트가 포함된 사용자 검색 중...');
    const [users] = await connection.execute(
      'SELECT employeeId, employeeName, account, jobTitle FROM users WHERE jobTitle LIKE ?',
      ['%(스탭권한)%']
    );
    
    console.log(`📋 수정 대상 사용자: ${users.length}명\n`);
    
    if (users.length === 0) {
      console.log('✅ 수정할 사용자가 없습니다.');
      return;
    }
    
    console.log('🔄 (스탭권한) 텍스트 제거 시작...');
    console.log('='.repeat(80));
    
    let updatedCount = 0;
    
    for (const user of users) {
      const originalJobTitle = user.jobTitle;
      const cleanedJobTitle = user.jobTitle.replace(/\(스탭권한\)/g, '').trim();
      
      if (cleanedJobTitle !== originalJobTitle) {
        await connection.execute(
          'UPDATE users SET jobTitle = ? WHERE employeeId = ?',
          [cleanedJobTitle, user.employeeId]
        );
        
        console.log(`✅ 수정: ${user.employeeName} (${user.account})`);
        console.log(`   - 변경 전: ${originalJobTitle}`);
        console.log(`   - 변경 후: ${cleanedJobTitle}`);
        console.log('');
        
        updatedCount++;
      }
    }
    
    console.log('='.repeat(80));
    console.log(`\n📊 처리 결과:`);
    console.log(`- ✅ 수정 완료: ${updatedCount}명`);
    console.log(`- 📋 전체 대상: ${users.length}명`);
    
    // 수정 결과 확인
    const [verifyUsers] = await connection.execute(
      'SELECT employeeName, account, jobTitle FROM users WHERE position LIKE ? ORDER BY employeeName',
      ['%스탭%']
    );
    
    console.log(`\n📋 현재 Staff 권한 사용자 목록 (${verifyUsers.length}명):`);
    console.log('-'.repeat(80));
    verifyUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.employeeName} (${user.account}) - ${user.jobTitle}`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔚 데이터베이스 연결 종료');
    }
  }
};

// 스크립트 실행
removeStaffSuffix();