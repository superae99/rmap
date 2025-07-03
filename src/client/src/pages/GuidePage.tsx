import React, { useState, useEffect } from 'react'

const GuidePage = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  // 섹션 변경 함수
  const showSection = (sectionId: string) => {
    setActiveSection(sectionId)
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // FAQ 토글 함수
  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId)
  }

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 상단으로 스크롤 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 프로그레스 계산
  const sections = ['overview', 'login', 'homepage', 'accounts', 'districts', 'faq']
  const progress = ((sections.indexOf(activeSection) + 1) / 6) * 100

  return React.createElement('div', {
    style: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: '1.6',
      color: '#2c3e50',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }
  },
    React.createElement('div', {
      style: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }
    },
      // 헤더
      React.createElement('header', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center' as const,
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }
      },
        React.createElement('h1', {
          style: {
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }
        }, '영업 상권 정보 시스템'),
        React.createElement('p', {
          style: {
            fontSize: '1.2rem',
            color: '#6c757d',
            marginBottom: '20px'
          }
        }, '카카오맵 기반 거래처 및 상권 관리 시스템'),
        React.createElement('span', {
          style: {
            display: 'inline-block',
            background: 'linear-gradient(135deg, #28a745, #20c997)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '50px',
            fontWeight: '600',
            fontSize: '0.9rem'
          }
        }, 'Version 1.0.0')
      ),

      // 네비게이션
      React.createElement('nav', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }
      },
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }
        },
          React.createElement('button', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center' as const,
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            },
            onClick: () => showSection('overview')
          }, '시스템 개요'),
          React.createElement('button', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center' as const,
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            },
            onClick: () => showSection('login')
          }, '로그인 및 기본 사용법'),
          React.createElement('button', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center' as const,
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            },
            onClick: () => showSection('homepage')
          }, '홈페이지 (지도 메인)'),
          React.createElement('button', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center' as const,
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            },
            onClick: () => showSection('accounts')
          }, '거래처 관리'),
          React.createElement('button', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center' as const,
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            },
            onClick: () => showSection('districts')
          }, '상권 관리'),
          React.createElement('button', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center' as const,
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer'
            },
            onClick: () => showSection('faq')
          }, '자주 묻는 질문')
        )
      ),

      // 프로그레스 바
      React.createElement('div', {
        style: {
          width: '100%',
          height: '4px',
          background: '#e9ecef',
          borderRadius: '2px',
          margin: '20px 0',
          overflow: 'hidden'
        }
      },
        React.createElement('div', {
          style: {
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
            width: progress + '%'
          }
        })
      ),

      // 시스템 개요 섹션
      activeSection === 'overview' && React.createElement('section', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          display: 'block',
          animation: 'fadeIn 0.5s ease-in'
        }
      },
        React.createElement('h2', {
          style: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '3px solid #667eea',
            paddingBottom: '10px'
          }
        }, '시스템 개요'),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '주요 기능'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '🗺️ 카카오맵 기반 지도 시각화'),
            React.createElement('p', {}, '거래처와 상권을 지도에서 한눈에 확인할 수 있습니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '🏢 거래처 관리'),
            React.createElement('p', {}, '거래처 정보 조회, 검색, 담당자 변경이 가능합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '🗺️ 상권 관리'),
            React.createElement('p', {}, '영업 구역별 상권 조회 및 분석 기능을 제공합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '🔍 실시간 필터링'),
            React.createElement('p', {}, '다양한 조건으로 데이터를 실시간 필터링할 수 있습니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '📊 통계 및 분석'),
            React.createElement('p', {}, '거래처 분포 및 상권 분석 기능을 제공합니다.')
          )
        )
      ),

      // 로그인 및 기본 사용법 섹션
      activeSection === 'login' && React.createElement('section', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          display: 'block',
          animation: 'fadeIn 0.5s ease-in'
        }
      },
        React.createElement('h2', {
          style: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '3px solid #667eea',
            paddingBottom: '10px'
          }
        }, '로그인 및 기본 사용법'),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '로그인 방법'),
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '15px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderLeft: '5px solid #667eea',
              position: 'relative' as const
            }
          },
            React.createElement('h4', {}, '접속'),
            React.createElement('p', {}, '시스템 URL로 접속합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderLeft: '5px solid #667eea',
              position: 'relative' as const
            }
          },
            React.createElement('h4', {}, '계정 입력'),
            React.createElement('p', {}, '제공받은 계정과 비밀번호를 입력합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderLeft: '5px solid #667eea',
              position: 'relative' as const
            }
          },
            React.createElement('h4', {}, '로그인'),
            React.createElement('p', {}, '로그인 버튼을 클릭합니다.')
          )
        ),
        React.createElement('div', {
          style: {
            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            borderRadius: '15px',
            padding: '25px',
            borderLeft: '5px solid #2196f3'
          }
        },
          React.createElement('h4', {
            style: {
              color: '#1565c0',
              fontWeight: '600',
              marginBottom: '10px'
            }
          }, '⚠️ 주의사항'),
          React.createElement('p', {}, '계정 정보는 관리자로부터 별도 제공받으시기 바랍니다.')
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '기본 화면 구성'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '💻 데스크톱 화면'),
            React.createElement('ul', {},
              React.createElement('li', {}, '상단 헤더: 메뉴 및 사용자 정보'),
              React.createElement('li', {}, '좌측 사이드바: 필터 패널 및 설정'),
              React.createElement('li', {}, '메인 영역: 지도 또는 데이터 테이블'),
              React.createElement('li', {}, '우측 영역: 상세 정보 및 액션')
            )
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '📱 모바일 화면'),
            React.createElement('p', {}, '개발중')
          )
        )
      ),

      // 홈페이지 (지도 메인) 섹션
      activeSection === 'homepage' && React.createElement('section', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          display: 'block',
          animation: 'fadeIn 0.5s ease-in'
        }
      },
        React.createElement('h2', {
          style: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '3px solid #667eea',
            paddingBottom: '10px'
          }
        }, '홈페이지 (지도 메인)'),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '지도 기본 조작'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '20px',
              border: '2px solid #e9ecef',
              textAlign: 'center' as const
            }
          },
            React.createElement('div', {
              style: {
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '1.5rem',
                color: 'white'
              }
            }, '🔍'),
            React.createElement('h4', {}, '확대/축소'),
            React.createElement('p', {}, '마우스 휠 또는 +/- 버튼 사용')
          ),
          React.createElement('div', {
            style: {
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '20px',
              border: '2px solid #e9ecef',
              textAlign: 'center' as const
            }
          },
            React.createElement('div', {
              style: {
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '1.5rem',
                color: 'white'
              }
            }, '👆'),
            React.createElement('h4', {}, '지도 이동'),
            React.createElement('p', {}, '마우스 드래그 또는 터치 드래그')
          ),
          React.createElement('div', {
            style: {
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '20px',
              border: '2px solid #e9ecef',
              textAlign: 'center' as const
            }
          },
            React.createElement('div', {
              style: {
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '1.5rem',
                color: 'white'
              }
            }, '📍'),
            React.createElement('h4', {}, '마커 클릭'),
            React.createElement('p', {}, '거래처 정보 팝업 표시')
          ),
          React.createElement('div', {
            style: {
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '20px',
              border: '2px solid #e9ecef',
              textAlign: 'center' as const
            }
          },
            React.createElement('div', {
              style: {
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                fontSize: '1.5rem',
                color: 'white'
              }
            }, '🎛️'),
            React.createElement('h4', {}, '필터 조작'),
            React.createElement('p', {}, '좌측 사이드바에서 필터 설정')
          )
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, 'RTM 채널별 마커'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #dc3545'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '2px',
                display: 'inline-block',
                marginRight: '10px',
                background: '#dc3545'
              }
            }),
            React.createElement('strong', {}, '업소'),
            React.createElement('p', {}, '업소 거래처')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #007bff'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '10px',
                background: '#007bff'
              }
            }),
            React.createElement('strong', {}, '매장'),
            React.createElement('p', {}, '매장 거래처')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #28a745'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '2px',
                transform: 'rotate(45deg)',
                display: 'inline-block',
                marginRight: '10px',
                background: '#28a745'
              }
            }),
            React.createElement('strong', {}, '스피리츠'),
            React.createElement('p', {}, '스피리츠 거래처')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #ffc107'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '2px',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                display: 'inline-block',
                marginRight: '10px',
                background: '#ffc107'
              }
            }),
            React.createElement('strong', {}, 'KA'),
            React.createElement('p', {}, 'KA 거래처')
          )
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '필터 및 설정'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, 'RTM 채널별 마커'),
            React.createElement('p', {}, '각 채널별 ON/OFF 토글로 마커 표시를 제어할 수 있습니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '지도 설정'),
            React.createElement('p', {}, '영역 표시 ON/OFF로 상권 경계를 표시하거나 숨길 수 있습니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '필터 패널'),
            React.createElement('p', {}, '지사, 지점, 담당자별 필터링이 가능하며, 실시간으로 적용됩니다.')
          )
        )
      ),

      // 거래처 관리 섹션
      activeSection === 'accounts' && React.createElement('section', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          display: 'block',
          animation: 'fadeIn 0.5s ease-in'
        }
      },
        React.createElement('h2', {
          style: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '3px solid #667eea',
            paddingBottom: '10px'
          }
        }, '거래처 관리'),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '거래처 검색'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '검색 조건'),
            React.createElement('ul', {},
              React.createElement('li', {}, '검색어: 거래처명, 사업장주소, 대표자명'),
              React.createElement('li', {}, '채널: 업소, 매장, 기타'),
              React.createElement('li', {}, '거래처 등급: S, A, B, C 등급'),
              React.createElement('li', {}, '담당자변경일: 특정 날짜 기준'),
              React.createElement('li', {}, '지사/지점: 조직별 필터'),
              React.createElement('li', {}, '담당자: 담당자별 필터')
            )
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '검색 방법'),
            React.createElement('div', {
              style: {
                display: 'flex',
                flexDirection: 'column' as const,
                gap: '15px',
                margin: '20px 0'
              }
            },
              React.createElement('div', {
                style: {
                  background: 'white',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  borderLeft: '5px solid #667eea',
                  position: 'relative' as const
                }
              }, '조건 설정'),
              React.createElement('div', {
                style: {
                  background: 'white',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  borderLeft: '5px solid #667eea',
                  position: 'relative' as const
                }
              }, '검색 실행'),
              React.createElement('div', {
                style: {
                  background: 'white',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  borderLeft: '5px solid #667eea',
                  position: 'relative' as const
                }
              }, '결과 확인'),
              React.createElement('div', {
                style: {
                  background: 'white',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  borderLeft: '5px solid #667eea',
                  position: 'relative' as const
                }
              }, '조건 초기화')
            )
          )
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '거래처 목록'),
        React.createElement('table', {
          style: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            margin: '20px 0',
            background: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('thead', {},
            React.createElement('tr', {},
              React.createElement('th', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  fontWeight: '600'
                }
              }, '컬럼'),
              React.createElement('th', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  fontWeight: '600'
                }
              }, '설명')
            )
          ),
          React.createElement('tbody', {},
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '거래처코드'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '고유 식별 코드')
            ),
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '거래처명'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '거래처 명칭')
            ),
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '채널'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '업소/매장/스피리츠/KA 구분')
            ),
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '등급'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, 'S/A/B/C 거래처 등급')
            ),
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '담당자'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '현재 담당 영업사원')
            ),
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '거래처주소'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '거래처 위치')
            ),
            React.createElement('tr', {},
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '액션'),
              React.createElement('td', {
                style: {
                  padding: '15px',
                  textAlign: 'center' as const,
                  borderBottom: '1px solid #e9ecef'
                }
              }, '상세보기 버튼')
            )
          )
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '엑셀 다운로드'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '다운로드 옵션'),
            React.createElement('p', {}, '현재 목록 다운로드 또는 템플릿 다운로드가 가능합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '파일 형식'),
            React.createElement('p', {}, '.xlsx (Excel) 형식으로 모든 거래처 상세 정보를 포함합니다.')
          )
        )
      ),

      // 상권 관리 섹션
      activeSection === 'districts' && React.createElement('section', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          display: 'block',
          animation: 'fadeIn 0.5s ease-in'
        }
      },
        React.createElement('h2', {
          style: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '3px solid #667eea',
            paddingBottom: '10px'
          }
        }, '상권 관리'),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '상권 조회'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '📋 목록 보기'),
            React.createElement('p', {}, '카드 형태로 상권 정보를 표시합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #667eea',
              transition: 'all 0.3s ease'
            }
          },
            React.createElement('h4', {
              style: {
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '10px'
              }
            }, '🗺️ 지도 보기'),
            React.createElement('p', {}, '지도에서 상권 경계를 시각화합니다.')
          )
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '상권 상태 구분'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #28a745'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '10px',
                background: '#28a745'
              }
            }),
            React.createElement('strong', {}, '직접 담당'),
            React.createElement('p', {}, '명확한 담당자가 배정된 상권')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #ffc107'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '10px',
                background: '#ffc107'
              }
            }),
            React.createElement('strong', {}, '관련 구역'),
            React.createElement('p', {}, '같은 지역 내 관련 담당자가 있는 상권')
          ),
          React.createElement('div', {
            style: {
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center' as const,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #dc3545'
            }
          },
            React.createElement('span', {
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '10px',
                background: '#dc3545'
              }
            }),
            React.createElement('strong', {}, '미배정'),
            React.createElement('p', {}, '담당자가 배정되지 않은 상권')
          )
        ),
        React.createElement('h3', {
          style: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#495057',
            margin: '25px 0 15px 0'
          }
        }, '상권 상세보기'),
        React.createElement('div', {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            margin: '20px 0'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '지도 표시'),
            React.createElement('p', {}, '상권 경계와 내부 거래처 마커를 함께 표시합니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '담당자별 색상 범례'),
            React.createElement('p', {}, '마커 색상으로 담당자를 구분할 수 있습니다.')
          ),
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
              borderRadius: '15px',
              padding: '25px',
              borderLeft: '5px solid #2196f3'
            }
          },
            React.createElement('h4', {
              style: {
                color: '#1565c0',
                fontWeight: '600',
                marginBottom: '10px'
              }
            }, '통계 정보'),
            React.createElement('p', {}, '거래처 수, 담당자 수 등의 통계를 제공합니다.')
          )
        )
      ),

      // 자주 묻는 질문 섹션
      activeSection === 'faq' && React.createElement('section', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          display: 'block',
          animation: 'fadeIn 0.5s ease-in'
        }
      },
        React.createElement('h2', {
          style: {
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '3px solid #667eea',
            paddingBottom: '10px'
          }
        }, '자주 묻는 질문'),
        React.createElement('div', {
          style: {
            background: '#f8f9fa',
            borderRadius: '10px',
            margin: '15px 0',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            },
            onClick: () => toggleFAQ('faq1')
          }, 'Q: 로그인이 안 됩니다.'),
          openFAQ === 'faq1' && React.createElement('div', {
            style: {
              padding: '20px',
              background: 'white'
            }
          },
            React.createElement('p', {}, '계정과 비밀번호를 확인하고, 관리자에게 계정 상태를 문의하세요. 브라우저 쿠키를 삭제하고 다시 시도해보세요.')
          )
        ),
        React.createElement('div', {
          style: {
            background: '#f8f9fa',
            borderRadius: '10px',
            margin: '15px 0',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            },
            onClick: () => toggleFAQ('faq2')
          }, 'Q: 지도가 로딩되지 않습니다.'),
          openFAQ === 'faq2' && React.createElement('div', {
            style: {
              padding: '20px',
              background: 'white'
            }
          },
            React.createElement('p', {}, '인터넷 연결을 확인하고, 브라우저를 새로고침해 보세요. JavaScript가 활성화되어 있는지 확인하고, 계속 문제가 있으면 관리자에게 문의하세요.')
          )
        ),
        React.createElement('div', {
          style: {
            background: '#f8f9fa',
            borderRadius: '10px',
            margin: '15px 0',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            },
            onClick: () => toggleFAQ('faq3')
          }, 'Q: 지점장인데 지사/지점 필터가 보이지 않습니다.'),
          openFAQ === 'faq3' && React.createElement('div', {
            style: {
              padding: '20px',
              background: 'white'
            }
          },
            React.createElement('p', {}, '지점장 권한은 보안상 지사/지점 필터가 숨겨집니다. 이는 정상적인 동작이며, 자신의 관할 지역만 조회할 수 있습니다.')
          )
        ),
        React.createElement('div', {
          style: {
            background: '#f8f9fa',
            borderRadius: '10px',
            margin: '15px 0',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            },
            onClick: () => toggleFAQ('faq4')
          }, 'Q: 담당자 변경이 안 됩니다.'),
          openFAQ === 'faq4' && React.createElement('div', {
            style: {
              padding: '20px',
              background: 'white'
            }
          },
            React.createElement('p', {}, '담당자 변경 권한이 있는지 확인하세요. 일반 사용자는 변경할 수 없으며, 지점장 이상의 권한이 필요합니다.')
          )
        ),
        React.createElement('div', {
          style: {
            background: '#f8f9fa',
            borderRadius: '10px',
            margin: '15px 0',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            },
            onClick: () => toggleFAQ('faq5')
          }, 'Q: 엑셀 다운로드가 안 됩니다.'),
          openFAQ === 'faq5' && React.createElement('div', {
            style: {
              padding: '20px',
              background: 'white'
            }
          },
            React.createElement('p', {}, '팝업 차단이 설정되어 있는지 확인하고, 브라우저의 다운로드 권한을 확인하세요. 파일이 너무 클 경우 시간이 오래 걸릴 수 있습니다.')
          )
        ),
        React.createElement('div', {
          style: {
            background: '#f8f9fa',
            borderRadius: '10px',
            margin: '15px 0',
            overflow: 'hidden',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
          }
        },
          React.createElement('div', {
            style: {
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            },
            onClick: () => toggleFAQ('faq6')
          }, 'Q: 지도가 느려요.'),
          openFAQ === 'faq6' && React.createElement('div', {
            style: {
              padding: '20px',
              background: 'white'
            }
          },
            React.createElement('p', {}, '대량의 마커가 표시될 때 느려질 수 있습니다. 필터를 사용하여 표시할 데이터를 줄이거나, 브라우저를 재시작해보세요.')
          )
        )
      ),

      // 연락처 그리드
      React.createElement('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          margin: '20px 0'
        }
      },
        React.createElement('div', {
          style: {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center' as const
          }
        },
          React.createElement('h4', {
            style: {
              marginBottom: '15px',
              fontSize: '1.3rem'
            }
          }, '🚨 시스템 장애 신고'),
          React.createElement('p', {}, '로그인 불가, 전체 시스템 다운 등 긴급 상황')
        ),
        React.createElement('div', {
          style: {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center' as const
          }
        },
          React.createElement('h4', {
            style: {
              marginBottom: '15px',
              fontSize: '1.3rem'
            }
          }, '💬 기술 지원'),
          React.createElement('p', {}, '시스템 오류, 버그 발견, 기능 요청')
        ),
        React.createElement('div', {
          style: {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center' as const
          }
        },
          React.createElement('h4', {
            style: {
              marginBottom: '15px',
              fontSize: '1.3rem'
            }
          }, '👤 계정 관련'),
          React.createElement('p', {}, '계정 생성, 비밀번호 초기화, 권한 변경')
        )
      )
    ),

    // 상단으로 스크롤 버튼
    showBackToTop && React.createElement('button', {
      style: {
        position: 'fixed' as const,
        bottom: '30px',
        right: '30px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        cursor: 'pointer',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease'
      },
      onClick: scrollToTop
    }, '↑')
  )
}

export default GuidePage