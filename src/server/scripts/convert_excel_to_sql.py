#!/usr/bin/env python3
import pandas as pd
import os
import sys
from datetime import datetime

def escape_sql_string(value):
    """SQL 문자열 이스케이프 처리"""
    if pd.isna(value) or value is None:
        return 'NULL'
    if isinstance(value, str):
        # 작은따옴표 이스케이프
        value = value.replace("'", "''")
        return f"'{value}'"
    elif isinstance(value, (int, float)):
        if pd.isna(value):
            return 'NULL'
        return str(value)
    elif isinstance(value, datetime):
        return f"'{value.strftime('%Y-%m-%d')}'"
    else:
        return f"'{str(value)}'"

def convert_excel_to_sql(excel_file, output_dir, batch_size=5000):
    """Excel 파일을 SQL INSERT 문으로 변환"""
    
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # Excel 파일 읽기
    print(f"Reading Excel file: {excel_file}")
    df = pd.read_excel(excel_file)
    print(f"Total records: {len(df)}")
    
    # 컬럼 매핑 (Excel 컬럼명 -> DB 컬럼명)
    column_mapping = {
        '거래처코드': 'partnerCode',
        '거래처명': 'partnerName',
        '간판명': 'signboardName',
        '지점': 'officeName',
        '지점코드': 'officeCode',
        '현재 담당 사번': 'currentManagerEmployeeId',
        '현재 담당 영업사원': 'currentManagerName',
        '이전 담당 사번': 'previousManagerEmployeeId',
        '이전 담당 영업사원': 'previousManagerName',
        '담당변경일': 'managerChangedDate',
        '담당변경사유': 'managerChangeReason',
        '채널': 'channel',
        'RTM채널': 'rtmChannel',
        '거래처등급': 'partnerGrade',
        '거래처관리등급': 'managementGrade',
        '사업자번호': 'businessNumber',
        '대표자성명(점주 성명)': 'ownerName',
        '우편번호(사업자기준)': 'postalCode',
        '기본주소(사업자기준)': 'businessAddress',
        '위도': 'latitude',
        '경도': 'longitude'
    }
    
    # 컬럼명 변경
    df = df.rename(columns=column_mapping)
    
    # 불필요한 컬럼 제거 (거래처코드.1은 중복 데이터이므로 제거)
    if '거래처코드.1' in df.columns:
        df = df.drop(columns=['거래처코드.1'])
    
    # 날짜 형식 변환
    if 'managerChangedDate' in df.columns:
        df['managerChangedDate'] = pd.to_datetime(df['managerChangedDate'], errors='coerce')
    
    # 배치 처리
    total_batches = (len(df) + batch_size - 1) // batch_size
    
    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        end_idx = min((batch_num + 1) * batch_size, len(df))
        batch_df = df.iloc[start_idx:end_idx]
        
        # SQL 파일 생성
        sql_filename = os.path.join(output_dir, f'partners_batch_{batch_num + 1}.sql')
        
        with open(sql_filename, 'w', encoding='utf-8') as f:
            # 트랜잭션 시작
            f.write("START TRANSACTION;\n\n")
            
            # 첫 번째 배치인 경우 기존 데이터 삭제
            if batch_num == 0:
                f.write("-- 기존 데이터를 배치로 삭제 (언두 로그 공간 절약)\n")
                f.write("SET autocommit = 0;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners LIMIT 10000;\n")
                f.write("COMMIT;\n")
                f.write("DELETE FROM partners;\n")
                f.write("COMMIT;\n")
                f.write("SET autocommit = 1;\n\n")
            
            # INSERT 문 작성
            f.write("-- Insert batch data\n")
            for _, row in batch_df.iterrows():
                columns = []
                values = []
                
                for col in df.columns:
                    if col in ['createdAt', 'updatedAt', 'isActive']:
                        continue  # 자동 생성 필드는 제외
                    
                    # current_manager_employee_id, previous_manager_employee_id 컬럼 처리
                    if col == 'currentManagerEmployeeId':
                        columns.append('`currentManagerEmployeeId`')
                        values.append(escape_sql_string(row[col]))
                        columns.append('`current_manager_employee_id`')
                        values.append(escape_sql_string(row[col]))
                    elif col == 'previousManagerEmployeeId':
                        columns.append('`previousManagerEmployeeId`')
                        values.append(escape_sql_string(row[col]))
                        columns.append('`previous_manager_employee_id`')
                        values.append(escape_sql_string(row[col]))
                    else:
                        columns.append(f"`{col}`")
                        values.append(escape_sql_string(row[col]))
                
                # isActive 추가
                columns.append('`isActive`')
                values.append('1')
                
                insert_sql = f"INSERT INTO partners ({', '.join(columns)}) VALUES ({', '.join(values)});\n"
                f.write(insert_sql)
            
            # 트랜잭션 커밋
            f.write("\nCOMMIT;\n")
        
        print(f"Created SQL file: {sql_filename} (Records {start_idx + 1} to {end_idx})")
    
    # 실행 스크립트 생성
    execute_script = os.path.join(output_dir, 'execute_all.sh')
    with open(execute_script, 'w') as f:
        f.write("#!/bin/bash\n\n")
        f.write("# Execute all SQL files in order\n")
        f.write("echo 'Starting database update...'\n\n")
        
        for batch_num in range(total_batches):
            sql_filename = f'partners_batch_{batch_num + 1}.sql'
            f.write(f"echo 'Executing {sql_filename}...'\n")
            f.write(f"platform db:sql < {sql_filename}\n")
            f.write(f"if [ $? -ne 0 ]; then\n")
            f.write(f"    echo 'Error executing {sql_filename}'\n")
            f.write(f"    exit 1\n")
            f.write(f"fi\n\n")
        
        f.write("echo 'Database update completed successfully!'\n")
    
    os.chmod(execute_script, 0o755)
    print(f"\nCreated execution script: {execute_script}")
    print(f"\nTotal SQL files created: {total_batches}")

if __name__ == "__main__":
    excel_file = "/Users/rae/projects/New_Map_Project/src/server/data/Partner_0701.xlsx"
    output_dir = "/Users/rae/projects/New_Map_Project/src/server/data/sql_batches"
    
    if not os.path.exists(excel_file):
        print(f"Error: Excel file not found: {excel_file}")
        sys.exit(1)
    
    convert_excel_to_sql(excel_file, output_dir, batch_size=5000)