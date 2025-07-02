import React from 'react'
import { FilterOptions, PartnerFilters } from '../../types/filter.types'

interface FilterPanelProps {
  options: FilterOptions | null
  filters: PartnerFilters
  onFilterChange: (key: keyof PartnerFilters, value: string | null) => void
  onReset: () => void
  onSearch: () => void
  loading?: boolean
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  options,
  filters,
  onFilterChange,
  onReset,
  onSearch,
  loading = false
}) => {
  
  if (loading || !options) {
    return (
      <div className="filter-panel">
        <div className="filter-loading">필터 옵션 로딩 중...</div>
      </div>
    )
  }

  const hasAnyFilter = Object.values(filters).some(value => value && value !== '')

  // 선택된 지사에 따른 지점 필터링
  const filteredOffices = filters.branchFilter 
    ? options.offices.filter(office => office.branchName === filters.branchFilter)
    : options.offices


  // 지사 변경 시 지점과 담당자 필터 초기화
  const handleBranchChange = (value: string) => {
    onFilterChange('branchFilter', value || null)
    if (filters.officeFilter) {
      onFilterChange('officeFilter', null)
    }
    if (filters.managerFilter) {
      onFilterChange('managerFilter', null)
    }
  }

  // 지점 변경 시 담당자 필터 초기화
  const handleOfficeChange = (value: string) => {
    onFilterChange('officeFilter', value || null)
    if (filters.managerFilter) {
      onFilterChange('managerFilter', null)
    }
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>필터</h3>
        {hasAnyFilter && (
          <button className="reset-btn" onClick={onReset}>
            초기화
          </button>
        )}
      </div>

      <div className="filter-controls">
        {/* 지사 필터 - admin만 사용 가능 */}
        {options.branches.length > 0 && (
          <div className="filter-group">
            <label>지사</label>
            <select
              value={filters.branchFilter || ''}
              onChange={(e) => handleBranchChange(e.target.value)}
            >
              <option value="">전체</option>
              {options.branches.map(branch => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 지점 필터 - admin만 사용 가능 */}
        {options.offices.length > 0 && (
          <div className="filter-group">
            <label>지점</label>
            <select
              key={`office-${filters.branchFilter}`}
              value={filters.officeFilter || ''}
              onChange={(e) => handleOfficeChange(e.target.value)}
            >
              <option value="">전체</option>
              {filteredOffices.map(office => (
                <option key={office.officeName} value={office.officeName}>
                  {office.officeName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 담당자 필터 */}
        {options.managers.length > 0 && (
          <div className="filter-group">
            <label>담당자</label>
            <select
              key={`manager-${filters.branchFilter}-${filters.officeFilter}`}
              value={filters.managerFilter || ''}
              onChange={(e) => onFilterChange('managerFilter', e.target.value || null)}
            >
              <option value="">전체</option>
              {options.managers
                .filter(manager => {
                  // 실시간 필터링 - 변수에 의존하지 않고 직접 계산
                  if (filters.branchFilter && manager.branchName !== filters.branchFilter) return false
                  if (filters.officeFilter && manager.officeName !== filters.officeFilter) return false
                  return true
                })
                .map(manager => (
                  <option key={manager.employeeId} value={manager.employeeId}>
                    {manager.employeeName} ({manager.officeName})
                  </option>
                ))
              }
            </select>
          </div>
        )}
      </div>

      {/* 조회 버튼을 별도 영역으로 분리 */}
      <div className="search-button-container">
        <button 
          className="search-btn" 
          onClick={() => {
            onSearch()
          }}
          disabled={loading}
        >
          {loading ? '조회 중...' : '🔍 거래처 조회'}
        </button>
      </div>

      <style>{`
        .filter-panel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }

        .filter-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .reset-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reset-btn:hover {
          background: #d32f2f;
        }

        .filter-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
        }

        .filter-group select,
        .filter-group input {
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          background: white;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .filter-loading {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }

        .search-button-container {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: center;
        }

        .search-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 100px;
          height: 32px;
        }

        .search-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .search-btn:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .filter-controls {
            grid-template-columns: 1fr;
          }
          
          .search-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default FilterPanel