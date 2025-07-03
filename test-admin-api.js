const fetch = require('node-fetch');

const testAdminAPI = async () => {
  try {
    // 1. 관리자 로그인
    console.log('🔐 관리자 로그인 중...');
    const loginResponse = await fetch('https://www.master-7rqtwti-fru7lrwunilmo.au.platformsh.site/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: 'admin',
        password: 'your_admin_password_here' // 실제 관리자 비밀번호로 교체 필요
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`로그인 실패: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ 로그인 성공');

    // 2. (스탭권한) 텍스트 제거 API 호출
    console.log('🔄 (스탭권한) 텍스트 제거 중...');
    const adminResponse = await fetch('https://www.master-7rqtwti-fru7lrwunilmo.au.platformsh.site/api/admin/remove-staff-suffix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    if (!adminResponse.ok) {
      throw new Error(`API 호출 실패: ${adminResponse.status}`);
    }

    const result = await adminResponse.json();
    console.log('📊 API 응답:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
};

testAdminAPI();