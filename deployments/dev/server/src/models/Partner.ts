import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity('partners')
@Index('idx_partner_office', ['officeCode'])
@Index('idx_partner_current_manager', ['currentManagerEmployeeId'])
@Index('idx_partner_previous_manager', ['previousManagerEmployeeId'])
@Index('idx_partner_grade', ['partnerGrade'])
@Index('idx_partner_channel', ['channel'])
@Index('idx_partner_management_grade', ['managementGrade'])
@Index('idx_partner_business_number', ['businessNumber'])
@Index('idx_partner_location', ['latitude', 'longitude'])
@Index('idx_partner_postal_code', ['postalCode'])
@Index('idx_partner_manager_changed_date', ['managerChangedDate'])
export class Partner {
  @PrimaryColumn({ length: 20, comment: '거래처코드' })
  partnerCode: string

  @Column({ length: 100, comment: '거래처명' })
  partnerName: string

  @Column({ length: 100, nullable: true, comment: '간판명' })
  signboardName: string

  @Column({ length: 100, nullable: true, comment: '지점' })
  officeName: string

  @Column({ length: 20, nullable: true, comment: '지점코드' })
  officeCode: string

  @Column({ length: 20, comment: '현재 담당 사번' })
  currentManagerEmployeeId: string

  @Column({ length: 50, comment: '현재 담당 영업사원' })
  currentManagerName: string

  @Column({ length: 20, nullable: true, comment: '변경 담당 사번' })
  previousManagerEmployeeId: string

  @Column({ length: 50, nullable: true, comment: '변경 담당 영업사원' })
  previousManagerName: string

  @Column({ type: 'date', nullable: true, comment: '담당자 변경일' })
  managerChangedDate: Date

  @Column({ length: 200, nullable: true, comment: '담당자 변경 사유' })
  managerChangeReason: string

  @Column({ length: 50, nullable: true, comment: '채널' })
  channel: string

  @Column({ length: 50, nullable: true, comment: 'RTM채널' })
  rtmChannel: string

  @Column({ length: 10, nullable: true, comment: '거래처등급' })
  partnerGrade: string

  @Column({ length: 20, nullable: true, comment: '거래처관리등급' })
  managementGrade: string

  @Column({ length: 20, nullable: true, comment: '사업자번호' })
  businessNumber: string

  @Column({ length: 50, nullable: true, comment: '대표자성명(점주 성명)' })
  ownerName: string

  @Column({ length: 10, nullable: true, comment: '우편번호(사업자기준)' })
  postalCode: string

  @Column({ type: 'text', nullable: true, comment: '기본주소(사업자기준)' })
  businessAddress: string

  @Column('decimal', { precision: 15, scale: 13, nullable: true, comment: '위도' })
  latitude: number

  @Column('decimal', { precision: 16, scale: 13, nullable: true, comment: '경도' })
  longitude: number

  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date

  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date

  @Column({ type: 'boolean', default: true, comment: '활성화 상태' })
  isActive: boolean

  @ManyToOne(() => User)
  @JoinColumn({ name: 'current_manager_employee_id', referencedColumnName: 'employeeId' })
  currentManager: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'previous_manager_employee_id', referencedColumnName: 'employeeId' })
  previousManager: User

  // SalesTerritory와의 관계는 제거 (순환 참조 방지)
  // office_code는 있지만 직접적인 관계는 설정하지 않음
}