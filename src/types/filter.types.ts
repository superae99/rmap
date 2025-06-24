export interface FilterOptions {
  branches: string[]
  offices: Office[]
  managers: Manager[]
}

export interface Office {
  officeName: string
  branchName: string
}

export interface Manager {
  employeeId: string
  employeeName: string
  branchName: string
  officeName: string
}

export interface PartnerFilters {
  branchFilter: string | null
  officeFilter: string | null
  managerFilter: string | null
}

export interface FilterState {
  options: FilterOptions | null
  filters: PartnerFilters
  loading: boolean
  error: string | null
}