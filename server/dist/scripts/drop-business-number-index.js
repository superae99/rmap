"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("../config/database");
async function dropBusinessNumberIndex() {
    try {
        console.log('🚀 사업자번호 UNIQUE 인덱스 제거 시작...');
        await database_1.AppDataSource.initialize();
        console.log('✅ 데이터베이스 연결 성공');
        // 인덱스 이름 확인 및 제거
        try {
            await database_1.AppDataSource.query(`DROP INDEX IDX_27c8ed797786c3e17d63e02da2 ON partners`);
            console.log('✅ UNIQUE 인덱스 제거 완료');
        }
        catch (error) {
            console.log('⚠️  인덱스가 이미 제거되었거나 존재하지 않습니다.');
        }
        // TypeORM 동기화로 스키마 업데이트
        await database_1.AppDataSource.synchronize();
        console.log('✅ 스키마 동기화 완료');
        // 현재 인덱스 확인
        const indexes = await database_1.AppDataSource.query(`
      SHOW INDEX FROM partners 
      WHERE Column_name = 'businessNumber'
    `);
        console.log('\n📋 현재 businessNumber 관련 인덱스:');
        indexes.forEach((idx) => {
            console.log(`- ${idx.Key_name} (Unique: ${idx.Non_unique === 0 ? 'Yes' : 'No'})`);
        });
    }
    catch (error) {
        console.error('❌ 오류 발생:', error);
    }
    finally {
        await database_1.AppDataSource.destroy();
    }
}
dropBusinessNumberIndex();
//# sourceMappingURL=drop-business-number-index.js.map