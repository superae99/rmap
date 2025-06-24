export interface Partner {
  partnerCode: string
  partnerName: string
  signboardName?: string
  officeName?: string
  officeCode?: string
  currentManagerEmployeeId: string
  currentManagerName: string
  previousManagerEmployeeId?: string
  previousManagerName?: string
  managerChangedDate?: string
  managerChangeReason?: string
  channel?: string
  partnerGrade?: string
  managementGrade?: string
  businessNumber?: string
  ownerName?: string
  postalCode?: string
  businessAddress?: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  currentManager?: {
    employeeId: string
    employeeName: string
    position?: string
    jobTitle?: string
  }
  previousManager?: {
    employeeId: string
    employeeName: string
    position?: string
    jobTitle?: string
  }
  office?: {
    territoryId: number
    officeName: string
    officeCode: string
  }
}