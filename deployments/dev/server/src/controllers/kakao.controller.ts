import { Request, Response } from 'express'

export const getKakaoMapScript = async (req: Request, res: Response) => {
  try {
    if (!process.env.KAKAO_API_KEY) {
      return res.status(500).json({ message: 'Kakao API key not configured' })
    }

    // 프록시 방식으로 변경 - API 키를 클라이언트에 노출하지 않음
    const scriptContent = `
      // 카카오맵 SDK 로드 (서버 프록시 통해)
      const script = document.createElement('script');
      script.src = '/api/kakao/proxy-script';
      script.async = true;
      script.onload = function() {
        if (window.kakaoMapLoadCallback) {
          window.kakaoMapLoadCallback();
        }
      };
      script.onerror = function() {
        if (window.kakaoMapErrorCallback) {
          window.kakaoMapErrorCallback();
        }
      };
      document.head.appendChild(script);
    `

    res.setHeader('Content-Type', 'application/javascript')
    res.send(scriptContent)
  } catch (error) {
    res.status(500).json({ message: '카카오맵 스크립트 로드 중 오류가 발생했습니다.' })
  }
}

export const searchAddresses = async (req: Request, res: Response) => {
  try {
    const { query } = req.query
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: '검색어를 입력해주세요.' })
    }

    if (!process.env.KAKAO_API_KEY) {
      return res.status(500).json({ message: 'Kakao API key not configured' })
    }

    // 카카오 API 호출
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error('Kakao API 호출 실패')
    }

    const data = await response.json() as any
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: '주소 검색 중 오류가 발생했습니다.' })
  }
}

export const getCoordinates = async (req: Request, res: Response) => {
  try {
    const { address } = req.query
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ message: '주소를 입력해주세요.' })
    }

    if (!process.env.KAKAO_API_KEY) {
      return res.status(500).json({ message: 'Kakao API key not configured' })
    }

    // 카카오 좌표 변환 API 호출
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error('Kakao API 호출 실패')
    }

    const data = await response.json() as any
    
    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0]
      res.json({
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
        address: result.address_name
      })
    } else {
      res.status(404).json({ message: '좌표를 찾을 수 없습니다.' })
    }
  } catch (error) {
    res.status(500).json({ message: '좌표 변환 중 오류가 발생했습니다.' })
  }
}