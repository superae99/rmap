"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoordinates = exports.searchAddresses = exports.getKakaoSDK = exports.getKakaoMapScript = void 0;
const getKakaoMapScript = async (req, res) => {
    try {
        if (!process.env.KAKAO_API_KEY) {
            return res.status(500).json({ message: 'Kakao API key not configured' });
        }
        // 프록시된 스크립트 URL 반환 (API 키 숨김)
        const scriptUrl = `/api/kakao/sdk.js`;
        res.json({ scriptUrl });
    }
    catch (error) {
        console.error('Kakao script error:', error);
        res.status(500).json({ message: '카카오맵 스크립트 로드 중 오류가 발생했습니다.' });
    }
};
exports.getKakaoMapScript = getKakaoMapScript;
const getKakaoSDK = async (_req, res) => {
    try {
        if (!process.env.KAKAO_API_KEY) {
            return res.status(500).json({ message: 'Kakao API key not configured' });
        }
        // 카카오 SDK를 프록시로 제공
        const kakaoResponse = await fetch(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.KAKAO_API_KEY}&autoload=false`);
        if (!kakaoResponse.ok) {
            throw new Error('Failed to fetch Kakao SDK');
        }
        const sdkContent = await kakaoResponse.text();
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(sdkContent);
    }
    catch (error) {
        console.error('Kakao SDK proxy error:', error);
        res.status(500).json({ message: '카카오맵 SDK 로드 중 오류가 발생했습니다.' });
    }
};
exports.getKakaoSDK = getKakaoSDK;
const searchAddresses = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: '검색어를 입력해주세요.' });
        }
        if (!process.env.KAKAO_API_KEY) {
            return res.status(500).json({ message: 'Kakao API key not configured' });
        }
        // 카카오 API 호출
        const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
            }
        });
        if (!response.ok) {
            throw new Error('Kakao API 호출 실패');
        }
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: '주소 검색 중 오류가 발생했습니다.' });
    }
};
exports.searchAddresses = searchAddresses;
const getCoordinates = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address || typeof address !== 'string') {
            return res.status(400).json({ message: '주소를 입력해주세요.' });
        }
        if (!process.env.KAKAO_API_KEY) {
            return res.status(500).json({ message: 'Kakao API key not configured' });
        }
        // 카카오 좌표 변환 API 호출
        const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
            headers: {
                'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
            }
        });
        if (!response.ok) {
            throw new Error('Kakao API 호출 실패');
        }
        const data = await response.json();
        if (data.documents && data.documents.length > 0) {
            const result = data.documents[0];
            res.json({
                lat: parseFloat(result.y),
                lng: parseFloat(result.x),
                address: result.address_name
            });
        }
        else {
            res.status(404).json({ message: '좌표를 찾을 수 없습니다.' });
        }
    }
    catch (error) {
        res.status(500).json({ message: '좌표 변환 중 오류가 발생했습니다.' });
    }
};
exports.getCoordinates = getCoordinates;
//# sourceMappingURL=kakao.controller.js.map