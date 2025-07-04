"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.logout = exports.getProfile = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const userRepository = database_1.AppDataSource.getRepository(User_1.User);
const login = async (req, res) => {
    try {
        const { account, password } = req.body;
        // 필수 필드 검증
        if (!account || !password) {
            return res.status(400).json({ message: '계정과 비밀번호를 입력해주세요.' });
        }
        // 사용자 찾기
        const user = await userRepository.findOne({
            where: { account, isActive: true }
        });
        if (!user) {
            return res.status(401).json({ message: '계정 또는 비밀번호가 올바르지 않습니다.' });
        }
        // 비밀번호 확인
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '계정 또는 비밀번호가 올바르지 않습니다.' });
        }
        // JWT 토큰 생성
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jsonwebtoken_1.default.sign({
            employeeId: user.employeeId,
            account: user.account,
            employeeName: user.employeeName,
            position: user.position,
            jobTitle: user.jobTitle
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        // 마지막 로그인 시간 업데이트
        user.lastLogin = new Date();
        await userRepository.save(user);
        // 비밀번호 제외하고 응답
        const { password: _, ...userWithoutPassword } = user;
        // JWT 토큰을 httpOnly 쿠키로 설정 (cross-origin 지원)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS에서만
            sameSite: 'none', // cross-origin 쿠키 전송을 위해 'none' 필요
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
            path: '/', // 명시적 경로 설정
            domain: process.env.NODE_ENV === 'production' ? '.platformsh.site' : undefined // production에서 도메인 공유
        };
        // 디버깅: 토큰에 포함된 사용자 정보 로그
        console.log('🔑 JWT 토큰 생성 - 사용자 정보:', {
            employeeId: user.employeeId,
            account: user.account,
            position: user.position,
            jobTitle: user.jobTitle
        });
        res.cookie('authToken', token, cookieOptions);
        res.json({
            message: '로그인에 성공했습니다.',
            token, // 기존 클라이언트 호환성을 위해 유지 (나중에 제거)
            user: userWithoutPassword
        });
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const employeeId = req.user?.employeeId;
        const user = await userRepository.findOne({
            where: { employeeId, isActive: true }
        });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.getProfile = getProfile;
// 로그아웃 시 쿠키 삭제
const logout = async (_req, res) => {
    // 여러 방법으로 쿠키 삭제 시도 (로그인과 동일한 설정)
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // cross-origin 지원
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.platformsh.site' : undefined
    };
    // 기본 clearCookie
    res.clearCookie('authToken', cookieOptions);
    // 만료된 쿠키로 덮어쓰기
    res.cookie('authToken', '', {
        ...cookieOptions,
        maxAge: 0,
        expires: new Date(0)
    });
    console.log('🗑️ 서버에서 쿠키 삭제 완료');
    res.json({ message: '로그아웃되었습니다.' });
};
exports.logout = logout;
// 패스워드 변경
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const employeeId = req.user?.employeeId;
        // 필수 필드 검증
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });
        }
        // 패스워드 정책 검증 (최소 8자, 숫자/문자/특수문자 포함)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: '비밀번호는 최소 8자 이상이며, 영문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.'
            });
        }
        // 현재 비밀번호와 새 비밀번호가 같은지 확인
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: '현재 비밀번호와 새 비밀번호가 동일합니다.' });
        }
        // 사용자 찾기
        const user = await userRepository.findOne({
            where: { employeeId, isActive: true }
        });
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        // 현재 비밀번호 확인
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
        }
        // 새 비밀번호 해시화
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // 비밀번호 업데이트
        user.password = hashedPassword;
        user.passwordChangedAt = new Date();
        await userRepository.save(user);
        res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    }
    catch (error) {
        console.error('패스워드 변경 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map