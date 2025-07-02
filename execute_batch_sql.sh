#!/bin/bash
# Platform.sh에서 배치 SQL 실행 스크립트

echo "🚀 거래처 데이터 배치 업로드 시작..."
echo "====================================="

# 압축 파일 해제
if [ -f "partners_batch_sql.tar.gz" ]; then
    echo "📦 배치 SQL 파일 압축 해제 중..."
    tar -xzf partners_batch_sql.tar.gz
    echo "✅ 압축 해제 완료"
else
    echo "❌ partners_batch_sql.tar.gz 파일을 찾을 수 없습니다."
    exit 1
fi

# 데이터베이스 연결 정보 확인
echo ""
echo "📋 데이터베이스 연결 정보:"
echo "DATABASE_URL: $DATABASE_URL"

# MySQL 연결 테스트
echo ""
echo "🔍 데이터베이스 연결 테스트..."
mysql -h database.internal -u user main -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 데이터베이스 연결 성공"
else
    echo "❌ 데이터베이스 연결 실패"
    exit 1
fi

# 현재 데이터 개수 확인
echo ""
echo "📊 작업 전 기존 데이터 개수:"
mysql -h database.internal -u user main -e "SELECT COUNT(*) as current_count FROM partners;"

echo ""
echo "⚠️  주의: 기존 데이터가 모두 삭제되고 새 데이터로 교체됩니다."
echo "계속 진행하려면 'yes'를 입력하세요:"
read confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ 작업이 취소되었습니다."
    exit 1
fi

# 배치 파일 순차 실행
echo ""
echo "🔄 배치 SQL 파일 실행 시작..."
total_batches=14
success_count=0

for i in $(seq -f "%03g" 1 $total_batches); do
    batch_file="batch_${i}.sql"
    
    if [ -f "$batch_file" ]; then
        echo "📦 배치 $i/$total_batches 실행 중... ($batch_file)"
        
        # SQL 실행
        mysql -h database.internal -u user main < "$batch_file" 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ 배치 $i 완료"
            ((success_count++))
        else
            echo "❌ 배치 $i 실패"
            echo "오류가 발생했습니다. 작업을 중단합니다."
            break
        fi
        
        # 진행률 표시
        echo "진행률: $success_count/$total_batches ($(( success_count * 100 / total_batches ))%)"
        echo ""
        
        # 잠시 대기 (서버 부하 방지)
        sleep 1
    else
        echo "❌ $batch_file 파일을 찾을 수 없습니다."
        break
    fi
done

# 최종 결과 확인
echo ""
echo "📊 작업 완료 후 데이터 개수:"
mysql -h database.internal -u user main -e "SELECT COUNT(*) as final_count FROM partners;"

echo ""
if [ $success_count -eq $total_batches ]; then
    echo "🎉 모든 배치 실행 완료! ($success_count/$total_batches)"
    echo "✅ 총 65,581개 거래처 데이터 업로드 성공"
else
    echo "⚠️  일부 배치만 실행됨: $success_count/$total_batches"
    echo "❌ 완전한 데이터 업로드 실패"
fi

# 임시 파일 정리
echo ""
echo "🧹 임시 파일 정리 중..."
rm -f batch_*.sql README.md run_all.sh
echo "✅ 정리 완료"