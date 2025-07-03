import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { User } from './User'

@Entity('sales_territories')
@Index('idx_territory_branch', ['branchCode'])
@Index('idx_territory_office', ['officeCode'])
@Index('idx_territory_manager', ['managerEmployeeId'])
@Index('idx_territory_sido', ['sido'])
@Index('idx_territory_gungu', ['gungu'])
@Index('idx_territory_adm_cd', ['admCd'])
export class SalesTerritory {
  @PrimaryGeneratedColumn({ comment: '영업구역 ID' })
  territoryId: number

  @Column({ length: 20, comment: '지사코드' })
  branchCode: string

  @Column({ length: 100, comment: '지사' })
  branchName: string

  @Column({ length: 20, comment: '지점코드' })
  officeCode: string

  @Column({ length: 100, comment: '지점' })
  officeName: string

  @Column({ length: 20, comment: '담당 사번' })
  managerEmployeeId: string

  @Column({ length: 50, comment: '담당 영업사원' })
  managerName: string

  @Column({ length: 50, nullable: true, comment: '시도' })
  sido: string

  @Column({ length: 50, nullable: true, comment: '시군구' })
  gungu: string

  @Column({ length: 20, nullable: true, comment: '행정구역코드' })
  admCd: string

  @Column({ length: 100, nullable: true, comment: '행정구역명' })
  admNm: string

  @Column({ length: 100, nullable: true, comment: '상세행정구역명' })
  admNm2: string

  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date

  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date

  @Column({ type: 'boolean', default: true, comment: '활성화 상태' })
  isActive: boolean

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_employee_id', referencedColumnName: 'employeeId' })
  manager: User
}