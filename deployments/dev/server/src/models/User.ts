import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum FieldType {
  STAFF = '스탭',
  FIELD = '필드'
}

@Entity('users')
@Index('idx_user_account', ['account'])
@Index('idx_user_headquarters', ['headquartersCode'])
@Index('idx_user_division', ['divisionCode'])
@Index('idx_user_branch', ['branchCode'])
@Index('idx_user_office', ['officeCode'])
@Index('idx_user_position', ['position'])
@Index('idx_user_work_status', ['workStatus'])
@Index('idx_user_field_type', ['fieldType'])
export class User {
  @PrimaryColumn({ length: 20, comment: '직원 ID' })
  employeeId: string

  @Column({ length: 50, comment: '성명' })
  employeeName: string

  @Column({ length: 20, nullable: true, comment: '본부코드' })
  headquartersCode: string

  @Column({ length: 100, nullable: true, comment: '본부' })
  headquartersName: string

  @Column({ length: 20, nullable: true, comment: '부문코드' })
  divisionCode: string

  @Column({ length: 100, nullable: true, comment: '부문' })
  divisionName: string

  @Column({ length: 20, nullable: true, comment: '지사코드' })
  branchCode: string

  @Column({ length: 100, nullable: true, comment: '지사' })
  branchName: string

  @Column({ length: 100, nullable: true, comment: '지점' })
  officeName: string

  @Column({ length: 20, nullable: true, comment: '지점코드' })
  officeCode: string

  @Column({ length: 50, nullable: true, comment: '직급' })
  position: string

  @Column({ length: 50, nullable: true, comment: '직책' })
  jobTitle: string

  @Column({ length: 50, nullable: true, comment: '발령' })
  assignment: string

  @Column({ length: 50, nullable: true, comment: '직무' })
  jobRole: string

  @Column({
    type: 'enum',
    enum: FieldType,
    nullable: true,
    comment: '스탭/필드'
  })
  fieldType: FieldType

  @Column({ length: 100, unique: true, comment: '계정' })
  account: string

  @Column({ length: 255, comment: '비밀번호' })
  password: string

  @Column({ length: 20, nullable: true, comment: '고용구분' })
  employmentType: string

  @Column({ length: 20, nullable: true, comment: '근무상태' })
  workStatus: string

  @CreateDateColumn({ comment: '생성일시' })
  createdAt: Date

  @UpdateDateColumn({ comment: '수정일시' })
  updatedAt: Date

  @Column({ type: 'timestamp', nullable: true, comment: '마지막 로그인' })
  lastLogin: Date

  @Column({ type: 'boolean', default: true, comment: '활성화 상태' })
  isActive: boolean

  @Column({ type: 'timestamp', nullable: true, comment: '비밀번호 변경일시' })
  passwordChangedAt: Date
}