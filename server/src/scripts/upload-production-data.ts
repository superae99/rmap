import 'reflect-metadata'
import { AppDataSource } from '../config/database'
import { User } from '../models/User'
import { Partner } from '../models/Partner'
import { Area } from '../models/Area'
import { SalesTerritory } from '../models/SalesTerritory'
import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'

async function uploadProductionData() {
  try {
    console.log('🚀 프로덕션 데이터 업로드 시작...')
    
    await AppDataSource.initialize()
    console.log('✅ 데이터베이스 연결 성공')

    const userRepository = AppDataSource.getRepository(User)
    const partnerRepository = AppDataSource.getRepository(Partner)
    const areaRepository = AppDataSource.getRepository(Area)
    const salesTerritoryRepository = AppDataSource.getRepository(SalesTerritory)

    // 1. 사용자 데이터 업로드
    console.log('👥 사용자 데이터 업로드 중...')
    const usersFilePath = '/app/data/users.xlsx'
    if (fs.existsSync(usersFilePath)) {
      const workbook = XLSX.readFile(usersFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const usersData = XLSX.utils.sheet_to_json(worksheet)

      for (const userData of usersData as any[]) {
        const hashedPassword = await bcrypt.hash(userData.password || 'password123', 10)
        
        const user = userRepository.create({
          employeeId: userData.employeeId,
          account: userData.account,
          password: hashedPassword,
          employeeName: userData.employeeName,
          position: userData.position,
          jobTitle: userData.jobTitle,
          branchName: userData.branchName,
          isActive: userData.isActive !== false
        })
        
        await userRepository.save(user)
      }
      console.log(`✅ ${usersData.length}명 사용자 업로드 완료`)
    }

    // 2. 거래처 데이터 업로드
    console.log('🏢 거래처 데이터 업로드 중...')
    const partnersFilePath = '/app/data/partners.xlsx'
    if (fs.existsSync(partnersFilePath)) {
      const workbook = XLSX.readFile(partnersFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const partnersData = XLSX.utils.sheet_to_json(worksheet)

      for (const partnerData of partnersData as any[]) {
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
          managerChangedDate: partnerData.managerChangedDate,
          managerChangeReason: partnerData.managerChangeReason,
          channel: partnerData.channel,
          rtmChannel: partnerData.rtmChannel,
          partnerGrade: partnerData.partnerGrade,
          managementGrade: partnerData.managementGrade,
          businessNumber: partnerData.businessNumber,
          ownerName: partnerData.ownerName,
          postalCode: partnerData.postalCode,
          businessAddress: partnerData.businessAddress,
          latitude: partnerData.latitude,
          longitude: partnerData.longitude,
          isActive: partnerData.isActive !== false
        })
        
        await partnerRepository.save(partner)
      }
      console.log(`✅ ${partnersData.length}개 거래처 업로드 완료`)
    }

    // 3. 영업 상권 데이터 업로드
    console.log('🗺️ 영업 상권 데이터 업로드 중...')
    const salesTerritoriesFilePath = '/app/data/sales_territories.xlsx'
    if (fs.existsSync(salesTerritoriesFilePath)) {
      const workbook = XLSX.readFile(salesTerritoriesFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const salesTerritoriesData = XLSX.utils.sheet_to_json(worksheet)

      for (const territoryData of salesTerritoriesData as any[]) {
        const territory = salesTerritoryRepository.create({
          branchCode: territoryData.branchCode,
          branchName: territoryData.branchName,
          officeCode: territoryData.officeCode,
          officeName: territoryData.officeName,
          managerEmployeeId: territoryData.managerEmployeeId,
          managerName: territoryData.managerName,
          sido: territoryData.sido,
          gungu: territoryData.gungu,
          admCd: territoryData.admCd,
          admNm: territoryData.admNm,
          admNm2: territoryData.admNm2,
          isActive: territoryData.isActive !== false
        })
        
        await salesTerritoryRepository.save(territory)
      }
      console.log(`✅ ${salesTerritoriesData.length}개 영업 상권 업로드 완료`)
    }

    // 4. 상권 데이터 업로드
    console.log('📍 상권 데이터 업로드 중...')
    const areasFilePath = '/app/data/areas.json'
    if (fs.existsSync(areasFilePath)) {
      const areasData = JSON.parse(fs.readFileSync(areasFilePath, 'utf-8'))

      for (const areaData of areasData as any[]) {
        const area = areaRepository.create({
          name: areaData.name,
          description: areaData.description,
          coordinates: areaData.coordinates,
          topojson: areaData.topojson,
          color: areaData.color,
          strokeColor: areaData.strokeColor,
          strokeWeight: areaData.strokeWeight,
          fillOpacity: areaData.fillOpacity,
          admCd: areaData.admCd,
          properties: areaData.properties,
          createdBy: areaData.createdBy,
          isActive: areaData.isActive !== false
        })
        
        await areaRepository.save(area)
      }
      console.log(`✅ ${areasData.length}개 상권 업로드 완료`)
    }

    console.log('🎉 모든 데이터 업로드 완료!')
    
  } catch (error) {
    console.error('❌ 데이터 업로드 중 오류 발생:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

uploadProductionData()