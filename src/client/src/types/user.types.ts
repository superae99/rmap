export enum FieldType {
  STAFF = '스탭',
  FIELD = '필드'
}

export interface User {
  employeeId: string
  employeeName: string
  headquartersCode?: string
  headquartersName?: string
  divisionCode?: string
  divisionName?: string
  branchCode?: string
  branchName?: string
  officeName?: string
  officeCode?: string
  position?: string
  jobTitle?: string
  assignment?: string
  jobRole?: string
  fieldType?: FieldType
  account: string
  employmentType?: string
  workStatus?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  isActive: boolean
  passwordChangedAt?: string
}