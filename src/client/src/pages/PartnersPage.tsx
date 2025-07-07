import React, { useEffect, useState } from 'react'
import { partnerAPI, authAPI } from '../services/api'
import type { Partner } from '../types/partner.types'
import { exportFilteredPartnersToExcel, downloadPartnerTemplate } from '../utils/excelUtils'
import { useFilters } from '../hooks/useFilters'
import FilterPanel from '../components/common/FilterPanel'

const PartnersPage = () => {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [managerChangeDate, setManagerChangeDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // useFilters 훅 사용 (홈화면과 동일)
  const { options, filters, updateFilter, resetFilters, loading: filterLoading } = useFilters()

  // 사용자 정보 로드 (필터 옵션은 useFilters 훅에서 자동 처리)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authAPI.getProfile()
        setUser(userData)
        
      } catch (error) {
        // 사용자 정보 로드 실패
      }
    }

    loadUser()
  }, [])

  // 필터 변경 핸들러 (HomePage와 동일)
  const handleFilterChange = (key: keyof typeof filters, value: string | null) => {
    updateFilter(key, value)
  }

  // 거래처 데이터 가져오기 함수
  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: 20,
      }
      
      if (searchTerm) params.search = searchTerm
      if (selectedChannel) params.channel = selectedChannel
      if (selectedGrade) params.grade = selectedGrade
      if (managerChangeDate) params.managerChangeDate = managerChangeDate
      if (filters.managerFilter) params.managerFilter = filters.managerFilter
      if (filters.branchFilter) params.branchFilter = filters.branchFilter
      if (filters.officeFilter) params.officeFilter = filters.officeFilter

      const response = await partnerAPI.getPartners(params)
      const partnersData = response.partners || response
      setPartners(Array.isArray(partnersData) ? partnersData : [])
      
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages)
        setTotalCount(response.pagination.total)
      }
      setHasSearched(true)
    } catch (error) {
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  // 페이지 변경시에만 자동 조회
  useEffect(() => {
    if (hasSearched && currentPage > 1) {
      fetchPartners()
    }
  }, [currentPage])

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPartners()
  }

  // 로컬 필터 변경 핸들러
  const handleLocalFilter = (setter: (value: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  // 거래처 상세보기
  const handlePartnerDetail = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowModal(true)
  }

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false)
    setSelectedPartner(null)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    const result = exportFilteredPartnersToExcel(
      partners,
      {
        searchTerm,
        channel: selectedChannel,
        grade: selectedGrade,
        managerChangeDate,
        managerFilter: filters.managerFilter || undefined,
        branchFilter: filters.branchFilter || undefined,
        officeFilter: filters.officeFilter || undefined
      }
    )

    if (result.success) {
      alert(`엑셀 파일이 다운로드되었습니다.\n파일명: ${result.filename}\n거래처 수: ${result.count}개`)
    } else {
      alert(`${result.error}`)
    }
  }

  // 템플릿 다운로드 핸들러
  const handleTemplateDownload = () => {
    const result = downloadPartnerTemplate()
    if (result.success) {
      alert(`템플릿 파일이 다운로드되었습니다.\n파일명: ${result.filename}`)
    } else {
      alert(`${result.error}`)
    }
  }


  return React.createElement('div',
    { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } },
    
    // 헤더
    React.createElement('div',
      { style: { marginBottom: '30px' } },
      React.createElement('div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
        React.createElement('h1', 
          { style: { margin: 0, fontSize: '28px', color: '#333' } }, 
          '거래처 관리'
        ),
        React.createElement('div',
          { style: { display: 'flex', gap: '10px' } },
          React.createElement('button',
            {
              onClick: handleTemplateDownload,
              style: {
                padding: '10px 16px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            },
            '템플릿 다운로드'
          ),
          React.createElement('button',
            {
              onClick: handleExcelDownload,
              style: {
                padding: '10px 16px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            },
            '엑셀 다운로드'
          )
        )
      ),
      React.createElement('p', 
        { style: { color: '#666', margin: 0 } }, 
        '거래처 정보를 조회하고 관리합니다.'
      )
    ),

    // 검색 및 기본 필터 영역
    React.createElement('div',
      { 
        style: { 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        } 
      },
      React.createElement('form', { onSubmit: handleSearch },
        React.createElement('div', 
          { style: { display: 'flex', alignItems: 'end', gap: '12px', flexWrap: 'wrap' } },
          
          // 검색어 입력
          React.createElement('div', { style: { flex: '1', minWidth: '200px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '검색어'
            ),
            React.createElement('input', {
              type: 'text',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              placeholder: '거래처명, 사업장주소, 대표자명 검색',
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            })
          ),

          // 채널 필터
          React.createElement('div', { style: { flex: '0 0 100px', minWidth: '100px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '채널'
            ),
            React.createElement('select', {
              value: selectedChannel,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleLocalFilter(setSelectedChannel, e.target.value),
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
              React.createElement('option', { value: '' }, '전체'),
              React.createElement('option', { value: '업소' }, '업소'),
              React.createElement('option', { value: '매장' }, '매장'),
              React.createElement('option', { value: '기타' }, '기타')
            )
          ),

          // 등급 필터
          React.createElement('div', { style: { flex: '0 0 100px', minWidth: '100px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '거래처 등급'
            ),
            React.createElement('select', {
              value: selectedGrade,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleLocalFilter(setSelectedGrade, e.target.value),
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
              React.createElement('option', { value: '' }, '전체'),
              React.createElement('option', { value: 'A' }, 'A등급'),
              React.createElement('option', { value: 'B' }, 'B등급'),
              React.createElement('option', { value: 'C' }, 'C등급')
            )
          ),

          // 담당자변경일 필터
          React.createElement('div', { style: { flex: '0 0 140px', minWidth: '140px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '담당자변경일'
            ),
            React.createElement('input', {
              type: 'date',
              value: managerChangeDate,
              onChange: (e) => handleLocalFilter(setManagerChangeDate, e.target.value),
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            })
          ),

          // 지사 필터 - 지점장에게는 숨김
          !(user?.position?.includes('지점장') || user?.jobTitle?.includes('지점장')) && React.createElement('div', { style: { flex: '0 0 100px', minWidth: '100px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '지사'
            ),
            React.createElement('select', {
              value: filters.branchFilter || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('branchFilter', e.target.value || null),
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
              React.createElement('option', { value: '' }, '전체'),
              ...(options?.branches || []).map(branch =>
                React.createElement('option', { key: branch, value: branch }, branch)
              )
            )
          ),

          // 지점 필터 - 지점장에게는 숨김
          !(user?.position?.includes('지점장') || user?.jobTitle?.includes('지점장')) && React.createElement('div', { style: { flex: '0 0 120px', minWidth: '120px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '지점'
            ),
            React.createElement('select', {
              value: filters.officeFilter || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('officeFilter', e.target.value || null),
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
              React.createElement('option', { value: '' }, '전체'),
              ...(options?.offices || [])
                .filter(office => !filters.branchFilter || office.branchName === filters.branchFilter)
                .map(office =>
                  React.createElement('option', { key: office.officeName, value: office.officeName }, office.officeName)
                )
            )
          ),

          // 담당자 필터
          React.createElement('div', { style: { flex: '0 0 120px', minWidth: '120px' } },
            React.createElement('label', 
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
              '담당자'
            ),
            React.createElement('select', {
              value: filters.managerFilter || '',
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('managerFilter', e.target.value || null),
              style: {
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
              React.createElement('option', { value: '' }, '전체'),
              ...(options?.managers || [])
                .filter(manager => {
                  if (filters.branchFilter && manager.branchName !== filters.branchFilter) return false
                  if (filters.officeFilter && manager.officeName !== filters.officeFilter) return false
                  return true
                })
                .map(manager =>
                  React.createElement('option', { key: manager.employeeId, value: manager.employeeId }, `${manager.employeeName} (${manager.officeName})`)
                )
            )
          ),

          // 검색 버튼
          React.createElement('button',
            {
              type: 'submit',
              style: {
                flex: '0 0 100px',
                minWidth: '100px',
                padding: '8px 16px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
            '검색'
          ),

          // 초기화 버튼
          React.createElement('button',
            {
              type: 'button',
              onClick: () => {
                setSearchTerm('')
                setSelectedChannel('')
                setSelectedGrade('')
                setManagerChangeDate('')
                resetFilters()
                setCurrentPage(1)
              },
              style: {
                flex: '0 0 80px',
                minWidth: '80px',
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                height: '38px',
                boxSizing: 'border-box'
              }
            },
            '초기화'
          )
        )
      )
    ),

    // 거래처 목록
    React.createElement('div',
      { 
        style: { 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        } 
      },
      
      // 테이블 헤더
      React.createElement('div',
        { 
          style: { 
            backgroundColor: '#f8f9fa', 
            padding: '15px 20px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          } 
        },
        React.createElement('h3', { style: { margin: 0 } }, '거래처 목록'),
        React.createElement('div',
          { style: { display: 'flex', alignItems: 'center', gap: '15px' } },
          React.createElement('div', 
            { style: { fontSize: '14px', color: '#666' } },
            loading ? '로딩 중...' : (
              searchTerm || selectedChannel || selectedGrade || managerChangeDate || filters.managerFilter || filters.branchFilter || filters.officeFilter
                ? `검색결과 ${totalCount}개 (전체에서 필터링됨)`
                : `총 ${totalCount}개`
            )
          ),
          !loading && partners.length > 0 && React.createElement('button',
            {
              onClick: handleExcelDownload,
              style: {
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }
            },
            '현재 목록 다운로드'
          )
        )
      ),

      // 테이블 본문
      loading ? 
        React.createElement('div',
          { style: { padding: '40px', textAlign: 'center', color: '#666' } },
          '데이터를 불러오는 중...'
        ) :
        !hasSearched ?
          React.createElement('div',
            { style: { padding: '40px', textAlign: 'center', color: '#666' } },
            '조회 버튼을 눌러 거래처 목록을 조회하세요.'
          ) :
        partners.length === 0 ?
          React.createElement('div',
            { style: { padding: '40px', textAlign: 'center', color: '#666' } },
            '검색 결과가 없습니다.'
          ) :
          React.createElement('div', { style: { overflowX: 'auto' } },
            React.createElement('table',
              { style: { width: '100%', borderCollapse: 'collapse' } },
              React.createElement('thead', null,
                React.createElement('tr',
                  { style: { backgroundColor: '#f8f9fa' } },
                  React.createElement('th', { style: tableHeaderStyle }, '거래처코드'),
                  React.createElement('th', { style: tableHeaderStyle }, '거래처명'),
                  React.createElement('th', { style: tableHeaderStyle }, '채널'),
                  React.createElement('th', { style: tableHeaderStyle }, '등급'),
                  React.createElement('th', { style: tableHeaderStyle }, '담당자'),
                  React.createElement('th', { style: tableHeaderStyle }, '사업장주소'),
                  React.createElement('th', { style: tableHeaderStyle }, '액션')
                )
              ),
              React.createElement('tbody', null,
                ...partners.map((partner) =>
                  React.createElement('tr',
                    { 
                      key: partner.partnerCode,
                      style: {
                        borderBottom: '1px solid #eee',
                        ':hover': { backgroundColor: '#f8f9fa' }
                      }
                    },
                    React.createElement('td', { style: tableCellStyle }, partner.partnerCode),
                    React.createElement('td', { style: tableCellStyle }, partner.partnerName),
                    React.createElement('td', { style: tableCellStyle }, 
                      React.createElement('span',
                        {
                          style: {
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: partner.channel === '업소' ? '#e3f2fd' : 
                                           partner.channel === '매장' ? '#f3e5f5' : '#e8f5e8',
                            color: partner.channel === '업소' ? '#1976d2' : 
                                   partner.channel === '매장' ? '#7b1fa2' : '#388e3c'
                          }
                        },
                        partner.channel || '-'
                      )
                    ),
                    React.createElement('td', { style: tableCellStyle }, partner.partnerGrade || '-'),
                    React.createElement('td', { style: tableCellStyle }, partner.currentManagerName || '-'),
                    React.createElement('td', { style: tableCellStyle }, 
                      partner.businessAddress ? 
                        (partner.businessAddress.length > 30 ? 
                          partner.businessAddress.substring(0, 30) + '...' : 
                          partner.businessAddress) : '-'
                    ),
                    React.createElement('td', { style: tableCellStyle },
                      React.createElement('button',
                        {
                          onClick: () => handlePartnerDetail(partner),
                          style: {
                            padding: '6px 12px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }
                        },
                        '상세보기'
                      )
                    )
                  )
                )
              )
            )
          )
    ),

    // 페이지네이션
    totalPages > 1 && React.createElement('div',
      { 
        style: { 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: '20px',
          gap: '5px'
        } 
      },
      // 첫 페이지 버튼
      currentPage > 3 && React.createElement('button',
        {
          onClick: () => handlePageChange(1),
          style: {
            padding: '8px 12px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            color: '#333',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        },
        '1'
      ),
      
      // 첫 페이지와 현재 페이지 사이에 간격이 있으면 ... 표시
      currentPage > 4 && React.createElement('span',
        { style: { padding: '8px 4px', color: '#666' } },
        '...'
      ),
      
      // 현재 페이지 주변 페이지들 (최대 5개)
      ...(() => {
        const startPage = Math.max(1, currentPage - 2)
        const endPage = Math.min(totalPages, currentPage + 2)
        const pages = []
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(
            React.createElement('button',
              {
                key: i,
                onClick: () => handlePageChange(i),
                style: {
                  padding: '8px 12px',
                  border: currentPage === i ? 'none' : '1px solid #ddd',
                  backgroundColor: currentPage === i ? '#667eea' : 'white',
                  color: currentPage === i ? 'white' : '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentPage === i ? 'bold' : 'normal'
                }
              },
              i
            )
          )
        }
        return pages
      })(),
      
      // 마지막 페이지와 현재 페이지 사이에 간격이 있으면 ... 표시
      currentPage < totalPages - 3 && React.createElement('span',
        { style: { padding: '8px 4px', color: '#666' } },
        '...'
      ),
      
      // 마지막 페이지 버튼
      currentPage < totalPages - 2 && React.createElement('button',
        {
          onClick: () => handlePageChange(totalPages),
          style: {
            padding: '8px 12px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            color: '#333',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        },
        totalPages
      ),
      
      // 페이지 정보 표시
      React.createElement('div',
        { 
          style: { 
            marginLeft: '20px', 
            color: '#666', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center'
          } 
        },
        `${currentPage} / ${totalPages} 페이지`
      )
    ),

    // 상세보기 모달
    showModal && selectedPartner && React.createElement('div',
      {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }
      },
      React.createElement('div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80%',
            overflowY: 'auto'
          }
        },
        React.createElement('div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('h3', { style: { margin: 0 } }, '거래처 상세 정보'),
          React.createElement('button',
            {
              onClick: closeModal,
              style: {
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }
            },
            '×'
          )
        ),
        React.createElement('div',
          { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } },
          Object.entries({
            '거래처코드': selectedPartner.partnerCode,
            '거래처명': selectedPartner.partnerName,
            '간판명': selectedPartner.signboardName,
            '영업소': selectedPartner.officeName,
            '채널': selectedPartner.channel,
            '거래처등급': selectedPartner.partnerGrade,
            '관리등급': selectedPartner.managementGrade,
            '사업자등록번호': selectedPartner.businessNumber,
            '대표자명': selectedPartner.ownerName,
            '우편번호': selectedPartner.postalCode,
            '사업장주소': selectedPartner.businessAddress,
            '현재담당자': selectedPartner.currentManagerName,
            '이전담당자': selectedPartner.previousManagerName,
            '담당자변경일': selectedPartner.managerChangedDate ? new Date(selectedPartner.managerChangedDate).toLocaleDateString() : null,
            '변경사유': selectedPartner.managerChangeReason
          }).map(([key, value]) =>
            React.createElement('div', { key, style: { gridColumn: key === '사업장주소' || key === '변경사유' ? 'span 2' : 'span 1' } },
              React.createElement('strong', null, key + ':'),
              React.createElement('p', { style: { margin: '5px 0 0 0' } }, value || '-')
            )
          )
        )
      )
    )
  )
}

// 스타일 상수
const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left' as const,
  borderBottom: '1px solid #ddd',
  backgroundColor: '#f8f9fa',
  fontWeight: 'bold',
  fontSize: '14px'
}

const tableCellStyle = {
  padding: '12px',
  borderBottom: '1px solid #eee',
  fontSize: '14px'
}

export default PartnersPage