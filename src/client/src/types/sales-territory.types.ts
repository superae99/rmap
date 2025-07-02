export interface SalesTerritory {
  territoryId: number
  branchCode: string
  branchName: string
  officeCode: string
  officeName: string
  managerEmployeeId: string
  managerName: string
  sido?: string
  gungu?: string
  admCd?: string
  admNm?: string
  admNm2?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  manager?: {
    employeeId: string
    employeeName: string
    position?: string
    jobTitle?: string
  }
}