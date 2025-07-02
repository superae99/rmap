import { Request, Response } from 'express'
import { AppDataSource } from '../config/database'
import { Area } from '../models/Area'
import { SalesTerritory } from '../models/SalesTerritory'
import { User } from '../models/User'

const areaRepository = AppDataSource.getRepository(Area)
const salesTerritoryRepository = AppDataSource.getRepository(SalesTerritory)

// 영역 목록 조회
export const getAreas = async (req: Request, res: Response) => {
  try {
    const areas = await areaRepository.find({
      order: { createdAt: 'DESC' }
    })

    res.json(areas)
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// 영업구역과 연결된 영역 조회 (adm_cd 기반 조인)
export const getAreasWithSalesTerritory = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { 
      branchFilter,    // 지사 필터 (partners와 동일)
      officeFilter,    // 지점 필터 (partners와 동일)
      managerFilter    // 담당 필터 (partners와 동일)
    } = req.query
    
    // 토큰이 있는 경우 인증 시도 (선택적 인증)
    if (req.headers.authorization) {
      try {
        const { authenticate } = await import('../middlewares/auth.middleware')
        await new Promise<void>((resolve, reject) => {
          authenticate(req as any, res as any, (err?: any) => {
            if (err) reject(err)
            else resolve()
          })
        })
      } catch (error) {
        req.user = undefined
      }
    }
    
    // areas와 sales_territories를 조인하여 데이터 조회
    const query = areaRepository
      .createQueryBuilder('area')
      .leftJoin(SalesTerritory, 'territory', 'territory.admCd = area.admCd')
      .select([
        'area.id',
        'area.name', 
        'area.coordinates',
        'area.topojson',
        'area.color',
        'area.strokeColor',
        'area.strokeWeight',
        'area.fillOpacity',
        'area.description',
        'area.admCd',
        'area.properties',
        'area.isActive',
        'area.createdAt',
        'area.updatedAt'
      ])
      .addSelect([
        'territory.territoryId',
        'territory.branchName',
        'territory.officeName', 
        'territory.managerName',
        'territory.managerEmployeeId',
        'territory.sido',
        'territory.gungu',
        'territory.admNm'
      ])
      .where('1 = 1') // 모든 영역을 가져오되, 담당자 여부로 활성 상태를 동적 결정

    // 권한별 필터링 적용 (더 관대한 접근)
    if (req.user) {
      const userPosition = req.user.position || ''
      const userJobTitle = req.user.jobTitle || ''
      const userAccount = req.user.account || ''

      // admin 계정: 모든 필터 사용 가능, 필터가 없으면 전체 데이터
      if (userAccount === 'admin' || userAccount === 'hyeongraekim' || userJobTitle.includes('시스템관리자')) {
        
        // 지사 필터 적용
        if (branchFilter) {
          query.andWhere('territory.branchName = :branchFilter', { branchFilter })
        }
        
        // 지점 필터 적용
        if (officeFilter) {
          query.andWhere('territory.officeName = :officeFilter', { officeFilter })
        }
        
        // 담당 필터 적용
        if (managerFilter) {
          query.andWhere('territory.managerEmployeeId = :managerFilter', { managerFilter })
        }
        
        // 필터가 없으면 모든 영역 반환 (admin은 전체 데이터 볼 수 있음)
      }
      // 지점장 계정: 해당 지점 소속 + 필터 적용
      else if (userPosition.includes('지점장') || userJobTitle.includes('지점장')) {
        const userRepository = AppDataSource.getRepository(User)
        const currentUser = await userRepository.findOne({
          where: { employeeId: req.user.employeeId }
        })

        if (currentUser && currentUser.officeName) {
          // 기본적으로 해당 지점 영역만 표시
          query.andWhere('(territory.officeName = :userOffice OR territory.officeName IS NULL)', { 
            userOffice: currentUser.officeName 
          })
          
          // 담당 필터가 있다면 추가 적용
          if (managerFilter) {
            query.andWhere('territory.managerEmployeeId = :managerFilter', { managerFilter })
          }
        } else {
          // 지점 정보가 없는 경우 담당자가 없는 영역까지 표시
          if (managerFilter) {
            query.andWhere('territory.managerEmployeeId = :managerFilter', { managerFilter })
          }
        }
      }
      // 일반 사용자: 자신의 담당 영업구역 + 담당자 없는 영역
      else {
        query.andWhere('(territory.managerEmployeeId = :userEmployeeId OR territory.managerEmployeeId IS NULL)', { 
          userEmployeeId: req.user.employeeId 
        })
      }
    } else {
      // 로그인하지 않은 경우: 담당자가 있는 영역만 표시 (보안)
      query.andWhere('territory.managerEmployeeId IS NOT NULL')
    }

    const areas = await query.getRawMany()
    

    // 중복 영역 제거 (같은 admCd는 첫 번째 담당자만 사용)
    const uniqueAreas = new Map()
    areas.forEach(row => {
      const areaId = row.area_admCd || row.area_id
      if (!uniqueAreas.has(areaId)) {
        uniqueAreas.set(areaId, row)
      }
    })

    // 결과를 적절한 형태로 변환
    const formattedAreas = Array.from(uniqueAreas.values()).map(row => {
      // 담당자가 있으면 활성, 없으면 비활성으로 동적 계산
      const hasManager = !!row.territory_territoryId && !!row.territory_managerEmployeeId
      
      return {
        id: row.area_id,
        name: row.area_name,
        coordinates: row.area_coordinates,
        topojson: row.area_topojson,
        color: row.area_color,
        strokeColor: row.area_strokeColor,
        strokeWeight: row.area_strokeWeight,
        fillOpacity: row.area_fillOpacity,
        description: row.area_description,
        admCd: row.area_admCd,
        properties: row.area_properties,
        isActive: true, // 모든 영역을 활성으로 표시 (담당자 정보는 salesTerritory에서 확인)
        salesTerritory: row.territory_territoryId ? {
          territoryId: row.territory_territoryId,
          branchName: row.territory_branchName,
          officeName: row.territory_officeName,
          managerName: row.territory_managerName,
          managerEmployeeId: row.territory_managerEmployeeId,
          sido: row.territory_sido,
          gungu: row.territory_gungu,
          admNm: row.territory_admNm
        } : null
      }
    })

    // 디버깅: 영역 상태 확인
    
    // 처음 3개 영역의 담당자 상태 확인
    formattedAreas.slice(0, 3).forEach((area, index) => {
      const managerInfo = area.salesTerritory ? `담당자: ${area.salesTerritory.managerName}` : '담당자 없음'
    })

    res.json(formattedAreas)
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// 영역 상세 조회
export const getArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const area = await areaRepository.findOne({
      where: { id: Number(id) }
    })

    if (!area) {
      return res.status(404).json({ message: '영역을 찾을 수 없습니다.' })
    }

    res.json(area)
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// 영역 생성
export const createArea = async (req: Request & { user?: any }, res: Response) => {
  try {
    const {
      name,
      coordinates,
      topojson,
      color,
      description,
      properties
    } = req.body

    // 필수 필드 검증
    if (!name || (!coordinates && !topojson)) {
      return res.status(400).json({ 
        message: '영역 이름과 좌표 또는 TopoJSON 데이터가 필요합니다.' 
      })
    }

    // 영역 생성
    const area = areaRepository.create({
      name,
      coordinates,
      topojson,
      color: color || '#' + Math.floor(Math.random()*16777215).toString(16), // 랜덤 색상
      description,
      properties,
      createdBy: req.user?.employeeId
    })

    await areaRepository.save(area)

    res.status(201).json({
      message: '영역이 생성되었습니다.',
      area
    })
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// 영역 수정
export const updateArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      coordinates,
      topojson,
      color,
      description,
      properties
    } = req.body

    const area = await areaRepository.findOne({
      where: { id: Number(id) }
    })

    if (!area) {
      return res.status(404).json({ message: '영역을 찾을 수 없습니다.' })
    }

    // 업데이트
    if (name !== undefined) area.name = name
    if (coordinates !== undefined) area.coordinates = coordinates
    if (topojson !== undefined) area.topojson = topojson
    if (color !== undefined) area.color = color
    if (description !== undefined) area.description = description
    if (properties !== undefined) area.properties = properties

    await areaRepository.save(area)

    res.json({
      message: '영역이 수정되었습니다.',
      area
    })
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// 영역 삭제
export const deleteArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const area = await areaRepository.findOne({
      where: { id: Number(id) }
    })

    if (!area) {
      return res.status(404).json({ message: '영역을 찾을 수 없습니다.' })
    }

    await areaRepository.remove(area)

    res.json({ message: '영역이 삭제되었습니다.' })
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}

// TopoJSON 파일 업로드 처리
export const uploadTopoJSON = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { name, topojson, color, description } = req.body

    if (!name || !topojson) {
      return res.status(400).json({ 
        message: '영역 이름과 TopoJSON 데이터가 필요합니다.' 
      })
    }

    // TopoJSON 유효성 검증
    try {
      const parsed = JSON.parse(JSON.stringify(topojson))
      if (!parsed.type || !parsed.objects) {
        throw new Error('Invalid TopoJSON format')
      }
    } catch (e) {
      return res.status(400).json({ 
        message: '유효하지 않은 TopoJSON 형식입니다.' 
      })
    }

    const area = areaRepository.create({
      name,
      topojson,
      color: color || '#3388ff',
      description,
      createdBy: req.user?.employeeId
    })

    await areaRepository.save(area)

    res.status(201).json({
      message: 'TopoJSON 영역이 생성되었습니다.',
      area
    })
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
}