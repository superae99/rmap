"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterOptions = exports.bulkUploadPartners = exports.deletePartner = exports.updatePartner = exports.createPartner = exports.getPartner = exports.getPartners = void 0;
const database_1 = require("../config/database");
const Partner_1 = require("../models/Partner");
const User_1 = require("../models/User");
const partnerRepository = database_1.AppDataSource.getRepository(Partner_1.Partner);
// 거래처 목록 조회
const getPartners = async (req, res) => {
    try {
        const { page = 1, limit, // limit 기본값 제거
        search = '', channel, grade, managerChangeDate, branchFilter, // 지사 필터
        officeFilter, // 지점 필터  
        managerFilter // 담당 필터
         } = req.query;
        const pageNum = Number(page);
        const limitNum = limit ? Number(limit) : null;
        const offset = limitNum ? (pageNum - 1) * limitNum : 0;
        // user 테이블과 JOIN하여 담당자 정보 포함
        const query = partnerRepository
            .createQueryBuilder('partner')
            .leftJoin(User_1.User, 'manager', 'manager.employeeId = partner.currentManagerEmployeeId');
        // 권한별 필터링 로직
        if (req.user) {
            const userPosition = req.user.position || '';
            const userJobTitle = req.user.jobTitle || '';
            const userAccount = req.user.account || '';
            const userFieldType = req.user.fieldType || '';
            // 디버깅: 파트너 조회 권한 체크
            const isAdminStaff = userAccount === 'admin' || userJobTitle.includes('시스템관리자') ||
                userPosition.includes('스탭') || userJobTitle.includes('스탭') || userFieldType === '스탭';
            console.log('🔍 getPartners - 권한 체크:', {
                account: userAccount,
                position: userPosition,
                jobTitle: userJobTitle,
                fieldType: userFieldType,
                isAdminStaff,
                filters: { branchFilter, officeFilter, managerFilter }
            });
            // admin/staff 계정: 모든 필터 사용 가능
            if (isAdminStaff) {
                // 지사 필터 적용
                if (branchFilter) {
                    query.andWhere('manager.branchName = :branchFilter', { branchFilter });
                }
                // 지점 필터 적용
                if (officeFilter) {
                    query.andWhere('partner.officeName = :officeFilter', { officeFilter });
                }
                // 담당 필터 적용
                if (managerFilter) {
                    query.andWhere('partner.currentManagerEmployeeId = :managerFilter', { managerFilter });
                }
            }
            // 지점장 계정: 담당 필터만 사용 가능 (해당 지점 소속 담당자들만)
            else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const currentUser = await userRepository.findOne({
                    where: { employeeId: req.user.employeeId }
                });
                if (currentUser && currentUser.officeName) {
                    // 해당 지점장의 지점 소속 담당자들만 필터링
                    query.andWhere('manager.officeName = :userOffice', {
                        userOffice: currentUser.officeName
                    });
                    // 담당 필터가 있다면 추가 적용
                    if (managerFilter) {
                        query.andWhere('partner.currentManagerEmployeeId = :managerFilter', { managerFilter });
                    }
                }
            }
            // 일반 사용자: 자신의 담당 거래처만
            else {
                query.andWhere('partner.currentManagerEmployeeId = :userEmployeeId', {
                    userEmployeeId: req.user.employeeId
                });
            }
        }
        // 검색 조건
        if (search) {
            query.andWhere('(partner.partnerName LIKE :search OR partner.signboardName LIKE :search OR partner.businessAddress LIKE :search OR partner.ownerName LIKE :search)', { search: `%${search}%` });
        }
        // 채널 필터
        if (channel) {
            query.andWhere('partner.channel = :channel', { channel });
        }
        // 거래처 등급 필터
        if (grade) {
            query.andWhere('partner.partnerGrade = :grade', { grade });
        }
        // 담당자변경일 필터 (정확한 날짜 매칭)
        if (managerChangeDate) {
            const filterDate = new Date(managerChangeDate);
            // 해당 날짜의 시작과 끝 시간으로 범위 검색
            const startOfDay = new Date(filterDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filterDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.andWhere('partner.managerChangedDate >= :startOfDay AND partner.managerChangedDate <= :endOfDay', {
                startOfDay,
                endOfDay
            });
        }
        // 활성화된 거래처만 조회
        query.andWhere('partner.isActive = :isActive', { isActive: true });
        // 페이지네이션 (limit이 없으면 전체 조회)
        let queryBuilder = query.orderBy('partner.createdAt', 'DESC');
        if (limitNum) {
            queryBuilder = queryBuilder.skip(offset).take(limitNum);
        }
        const [partners, total] = await queryBuilder.getManyAndCount();
        const response = { partners };
        // limit이 있을 때만 pagination 정보 포함
        if (limitNum) {
            response.pagination = {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            };
        }
        else {
            response.total = total;
        }
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getPartners = getPartners;
// 거래처 상세 조회
const getPartner = async (req, res) => {
    try {
        const { partnerCode } = req.params;
        const partner = await partnerRepository.findOne({
            where: { partnerCode },
            relations: ['currentManager', 'previousManager']
        });
        if (!partner) {
            return res.status(404).json({ message: '거래처를 찾을 수 없습니다.' });
        }
        res.json(partner);
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getPartner = getPartner;
// 거래처 생성
const createPartner = async (req, res) => {
    try {
        const { partnerCode, partnerName, signboardName, officeName, officeCode, currentManagerEmployeeId, currentManagerName, previousManagerEmployeeId, previousManagerName, managerChangedDate, managerChangeReason, channel, partnerGrade, managementGrade, businessNumber, ownerName, postalCode, businessAddress, latitude, longitude } = req.body;
        // 필수 필드 검증
        if (!partnerCode || !partnerName || !currentManagerEmployeeId || !currentManagerName) {
            return res.status(400).json({ message: '필수 정보를 입력해주세요. (거래처코드, 거래처명, 담당자 정보)' });
        }
        // 중복 거래처 코드 확인
        const existingPartner = await partnerRepository.findOne({
            where: { partnerCode }
        });
        if (existingPartner) {
            return res.status(400).json({ message: '이미 존재하는 거래처 코드입니다.' });
        }
        // 거래처 생성
        const partner = partnerRepository.create({
            partnerCode,
            partnerName,
            signboardName,
            officeName,
            officeCode,
            currentManagerEmployeeId,
            currentManagerName,
            previousManagerEmployeeId,
            previousManagerName,
            managerChangedDate: managerChangedDate ? new Date(managerChangedDate) : undefined,
            managerChangeReason,
            channel,
            partnerGrade,
            managementGrade,
            businessNumber,
            ownerName,
            postalCode,
            businessAddress,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            isActive: true
        });
        await partnerRepository.save(partner);
        res.status(201).json({
            message: '거래처가 등록되었습니다.',
            partner
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.createPartner = createPartner;
// 거래처 수정
const updatePartner = async (req, res) => {
    try {
        const { partnerCode } = req.params;
        const { partnerName, signboardName, officeName, officeCode, currentManagerEmployeeId, currentManagerName, previousManagerEmployeeId, previousManagerName, managerChangedDate, managerChangeReason, channel, partnerGrade, managementGrade, businessNumber, ownerName, postalCode, businessAddress, latitude, longitude, isActive } = req.body;
        const partner = await partnerRepository.findOne({
            where: { partnerCode }
        });
        if (!partner) {
            return res.status(404).json({ message: '거래처를 찾을 수 없습니다.' });
        }
        // 담당자 변경 시 이전 담당자 정보 자동 저장
        if (currentManagerEmployeeId !== undefined && currentManagerEmployeeId !== partner.currentManagerEmployeeId) {
            // 기존 담당자 정보를 이전 담당자로 저장
            partner.previousManagerEmployeeId = partner.currentManagerEmployeeId;
            partner.previousManagerName = partner.currentManagerName;
            partner.currentManagerEmployeeId = currentManagerEmployeeId;
            partner.managerChangedDate = managerChangedDate ? new Date(managerChangedDate) : new Date();
            console.log(`📝 담당자 변경: ${partner.partnerCode} - ${partner.previousManagerName} → ${currentManagerName}`);
        }
        // 일반 업데이트
        if (partnerName !== undefined)
            partner.partnerName = partnerName;
        if (signboardName !== undefined)
            partner.signboardName = signboardName;
        if (officeName !== undefined)
            partner.officeName = officeName;
        if (officeCode !== undefined)
            partner.officeCode = officeCode;
        if (currentManagerName !== undefined)
            partner.currentManagerName = currentManagerName;
        if (previousManagerEmployeeId !== undefined)
            partner.previousManagerEmployeeId = previousManagerEmployeeId;
        if (previousManagerName !== undefined)
            partner.previousManagerName = previousManagerName;
        if (managerChangedDate !== undefined && !currentManagerEmployeeId)
            partner.managerChangedDate = managerChangedDate ? new Date(managerChangedDate) : null;
        if (managerChangeReason !== undefined)
            partner.managerChangeReason = managerChangeReason;
        if (channel !== undefined)
            partner.channel = channel;
        if (partnerGrade !== undefined)
            partner.partnerGrade = partnerGrade;
        if (managementGrade !== undefined)
            partner.managementGrade = managementGrade;
        if (businessNumber !== undefined)
            partner.businessNumber = businessNumber;
        if (ownerName !== undefined)
            partner.ownerName = ownerName;
        if (postalCode !== undefined)
            partner.postalCode = postalCode;
        if (businessAddress !== undefined)
            partner.businessAddress = businessAddress;
        if (latitude !== undefined)
            partner.latitude = latitude ? Number(latitude) : null;
        if (longitude !== undefined)
            partner.longitude = longitude ? Number(longitude) : null;
        if (isActive !== undefined)
            partner.isActive = isActive;
        await partnerRepository.save(partner);
        res.json({
            message: '거래처 정보가 수정되었습니다.',
            partner
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.updatePartner = updatePartner;
// 거래처 삭제 (소프트 삭제)
const deletePartner = async (req, res) => {
    try {
        const { partnerCode } = req.params;
        const partner = await partnerRepository.findOne({
            where: { partnerCode }
        });
        if (!partner) {
            return res.status(404).json({ message: '거래처를 찾을 수 없습니다.' });
        }
        // 소프트 삭제 (isActive를 false로 변경)
        partner.isActive = false;
        await partnerRepository.save(partner);
        res.json({ message: '거래처가 삭제되었습니다.' });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.deletePartner = deletePartner;
// 거래처 일괄 업로드
const bulkUploadPartners = async (req, res) => {
    try {
        const { partners } = req.body;
        if (!Array.isArray(partners) || partners.length === 0) {
            return res.status(400).json({ message: '업로드할 거래처 데이터가 없습니다.' });
        }
        const createdPartners = [];
        const errors = [];
        for (let i = 0; i < partners.length; i++) {
            const partnerData = partners[i];
            try {
                // 필수 필드 검증
                if (!partnerData.partnerCode || !partnerData.partnerName ||
                    !partnerData.currentManagerEmployeeId || !partnerData.currentManagerName) {
                    errors.push({
                        index: i,
                        partnerCode: partnerData.partnerCode,
                        error: '필수 필드가 누락되었습니다.'
                    });
                    continue;
                }
                // 중복 체크
                const existing = await partnerRepository.findOne({
                    where: { partnerCode: partnerData.partnerCode }
                });
                if (existing) {
                    errors.push({
                        index: i,
                        partnerCode: partnerData.partnerCode,
                        error: '이미 존재하는 거래처 코드입니다.'
                    });
                    continue;
                }
                const partner = partnerRepository.create({
                    partnerCode: partnerData.partnerCode,
                    partnerName: partnerData.partnerName,
                    signboardName: partnerData.signboardName,
                    officeName: partnerData.officeName,
                    officeCode: partnerData.officeCode,
                    currentManagerEmployeeId: partnerData.currentManagerEmployeeId,
                    currentManagerName: partnerData.currentManagerName,
                    previousManagerEmployeeId: partnerData.previousManagerEmployeeId,
                    previousManagerName: partnerData.previousManagerName,
                    managerChangedDate: partnerData.managerChangedDate ? new Date(partnerData.managerChangedDate) : undefined,
                    managerChangeReason: partnerData.managerChangeReason,
                    channel: partnerData.channel,
                    partnerGrade: partnerData.partnerGrade,
                    managementGrade: partnerData.managementGrade,
                    businessNumber: partnerData.businessNumber,
                    ownerName: partnerData.ownerName,
                    postalCode: partnerData.postalCode,
                    businessAddress: partnerData.businessAddress,
                    latitude: partnerData.latitude ? Number(partnerData.latitude) : undefined,
                    longitude: partnerData.longitude ? Number(partnerData.longitude) : undefined,
                    isActive: true
                });
                const saved = await partnerRepository.save(partner);
                createdPartners.push(saved);
            }
            catch (error) {
                errors.push({
                    index: i,
                    partnerCode: partnerData.partnerCode,
                    error: error.message
                });
            }
        }
        res.json({
            message: `${createdPartners.length}개 거래처가 등록되었습니다.`,
            created: createdPartners.length,
            failed: errors.length,
            errors
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.bulkUploadPartners = bulkUploadPartners;
// 필터 옵션 조회 (실제 거래처 데이터가 있는 지사/지점/담당자만)
const getFilterOptions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const userPosition = req.user.position || '';
        const userJobTitle = req.user.jobTitle || '';
        const userAccount = req.user.account || '';
        const userFieldType = req.user.fieldType || '';
        // 디버깅: 사용자 권한 정보 로그
        console.log('🔍 getFilterOptions - 사용자 권한 체크:', {
            account: userAccount,
            position: userPosition,
            jobTitle: userJobTitle,
            fieldType: userFieldType,
            isAdmin: userAccount === 'admin' || userJobTitle.includes('시스템관리자'),
            isStaff: userPosition.includes('스탭') || userJobTitle.includes('스탭') || userFieldType === '스탭'
        });
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        let branches = [];
        let offices = [];
        let managers = [];
        // admin/staff 계정: 실제 거래처 데이터가 있는 모든 필터 옵션 제공
        if (userAccount === 'admin' || userJobTitle.includes('시스템관리자') ||
            userPosition.includes('스탭') || userJobTitle.includes('스탭') || userFieldType === '스탭') {
            // 지사 목록 (실제 거래처가 있는 지사만)
            const branchData = await userRepository
                .createQueryBuilder('user')
                .innerJoin(Partner_1.Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
                .select('DISTINCT user.branchName', 'branchName')
                .where('user.branchName IS NOT NULL')
                .andWhere('partner.isActive = :isActive', { isActive: true })
                .orderBy('user.branchName')
                .getRawMany();
            branches = branchData.map(b => b.branchName);
            // 지점 목록 (실제 거래처가 있는 지점만, 지사별로 그룹화)
            const officeData = await userRepository
                .createQueryBuilder('user')
                .innerJoin(Partner_1.Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
                .select(['user.officeName', 'user.branchName'])
                .where('user.officeName IS NOT NULL')
                .andWhere('user.branchName IS NOT NULL')
                .andWhere('partner.isActive = :isActive', { isActive: true })
                .groupBy('user.officeName')
                .addGroupBy('user.branchName')
                .orderBy('user.branchName')
                .addOrderBy('user.officeName')
                .getRawMany();
            offices = officeData.map(item => ({
                officeName: item.user_officeName,
                branchName: item.user_branchName
            }));
            // 담당자 목록 (실제 거래처가 있는 담당자만, 지점장 제외)
            managers = await userRepository
                .createQueryBuilder('user')
                .innerJoin(Partner_1.Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
                .select(['user.employeeId', 'user.employeeName', 'user.branchName', 'user.officeName'])
                .where('user.isActive = :isActive', { isActive: true })
                .andWhere('partner.isActive = :isActive', { isActive: true })
                .andWhere('user.position NOT LIKE :position', { position: '%지점장%' })
                .andWhere('user.jobTitle NOT LIKE :jobTitle', { jobTitle: '%지점장%' })
                .groupBy('user.employeeId')
                .addGroupBy('user.employeeName')
                .addGroupBy('user.branchName')
                .addGroupBy('user.officeName')
                .orderBy('user.branchName')
                .addOrderBy('user.officeName')
                .addOrderBy('user.employeeName')
                .getMany();
        }
        // 지점장 계정: 해당 지점에서 실제 거래처가 있는 담당자만
        else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
            const currentUser = await userRepository.findOne({
                where: { employeeId: req.user.employeeId }
            });
            if (currentUser && currentUser.officeName) {
                // 해당 지점에서 실제 거래처가 있는 담당자들만 (지점장 제외)
                managers = await userRepository
                    .createQueryBuilder('user')
                    .innerJoin(Partner_1.Partner, 'partner', 'partner.currentManagerEmployeeId = user.employeeId')
                    .select(['user.employeeId', 'user.employeeName', 'user.branchName', 'user.officeName'])
                    .where('user.officeName = :officeName', { officeName: currentUser.officeName })
                    .andWhere('user.isActive = :isActive', { isActive: true })
                    .andWhere('partner.isActive = :isActive', { isActive: true })
                    .andWhere('user.position NOT LIKE :position', { position: '%지점장%' })
                    .andWhere('user.jobTitle NOT LIKE :jobTitle', { jobTitle: '%지점장%' })
                    .groupBy('user.employeeId')
                    .addGroupBy('user.employeeName')
                    .addGroupBy('user.branchName')
                    .addGroupBy('user.officeName')
                    .orderBy('user.employeeName')
                    .getMany();
            }
        }
        // 일반 사용자: 본인이 담당하는 거래처가 있는 경우만
        else {
            const hasPartners = await partnerRepository
                .createQueryBuilder('partner')
                .where('partner.currentManagerEmployeeId = :employeeId', { employeeId: req.user.employeeId })
                .andWhere('partner.isActive = :isActive', { isActive: true })
                .getCount();
            if (hasPartners > 0) {
                managers = await userRepository
                    .createQueryBuilder('user')
                    .select(['user.employeeId', 'user.employeeName', 'user.branchName', 'user.officeName'])
                    .where('user.employeeId = :employeeId', { employeeId: req.user.employeeId })
                    .getMany();
            }
        }
        const managersData = managers.map(m => ({
            employeeId: m.employeeId,
            employeeName: m.employeeName,
            branchName: m.branchName,
            officeName: m.officeName
        }));
        console.log(`🎯 실제 거래처 데이터가 있는 필터 옵션 조회 완료:`, {
            branches: branches.length,
            offices: offices.length,
            managers: managersData.length
        });
        res.json({
            branches,
            offices,
            managers: managersData
        });
    }
    catch (error) {
        console.error('필터 옵션 조회 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getFilterOptions = getFilterOptions;
//# sourceMappingURL=partner.controller.js.map