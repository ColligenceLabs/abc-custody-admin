export interface AccessLogEntry {
  id: string
  timestamp: string
  admin: string
  ip: string
  location: string
  userAgent: string
  action: string
  status: 'success' | 'failed' | 'blocked'
  reason?: string
}

// 현재 시간 기준으로 동적 생성
const now = new Date()
const getTimestamp = (hoursAgo: number, minutesAgo: number = 0) => {
  const date = new Date(now.getTime() - (hoursAgo * 60 + minutesAgo) * 60 * 1000)
  return date.toISOString()
}

export const adminAccessLogs: AccessLogEntry[] = [
  // 최근 24시간 데이터
  {
    id: '1',
    timestamp: getTimestamp(0, 30), // 30분 전
    admin: 'admin@company.com',
    ip: '192.168.1.100',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '관리자 페이지 접근',
    status: 'success'
  },
  {
    id: '2',
    timestamp: getTimestamp(0, 45), // 45분 전
    admin: 'manager@company.com',
    ip: '203.252.33.45',
    location: 'Busan, KR',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '보안 설정 변경',
    status: 'success'
  },
  {
    id: '3',
    timestamp: getTimestamp(1, 20), // 1시간 20분 전
    admin: 'finance@company.com',
    ip: '192.168.1.105',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '출금 승인',
    status: 'success'
  },
  {
    id: '4',
    timestamp: getTimestamp(2, 15), // 2시간 15분 전
    admin: 'admin@company.com',
    ip: '192.168.1.100',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '로그인 성공',
    status: 'success'
  },
  {
    id: '5',
    timestamp: getTimestamp(3, 10), // 3시간 10분 전
    admin: 'operations@company.com',
    ip: '10.0.0.25',
    location: 'Incheon, KR',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '사용자 권한 수정',
    status: 'success'
  },
  {
    id: '6',
    timestamp: getTimestamp(4, 5), // 4시간 5분 전
    admin: 'admin@company.com',
    ip: '192.168.1.100',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '시스템 설정 조회',
    status: 'success'
  },
  {
    id: '7',
    timestamp: getTimestamp(5, 45), // 5시간 45분 전
    admin: 'admin@company.com',
    ip: '192.168.1.100',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '2FA 인증 실패',
    status: 'failed',
    reason: '잘못된 인증코드'
  },
  {
    id: '8',
    timestamp: getTimestamp(6, 30), // 6시간 30분 전
    admin: 'manager@company.com',
    ip: '203.252.33.45',
    location: 'Busan, KR',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '로그인 실패',
    status: 'failed',
    reason: '잘못된 비밀번호'
  },
  {
    id: '9',
    timestamp: getTimestamp(8, 15), // 8시간 15분 전
    admin: 'unknown@hacker.com',
    ip: '45.123.45.67',
    location: 'Unknown',
    userAgent: 'curl/7.68.0',
    action: '무단 접근 시도',
    status: 'blocked',
    reason: 'IP 화이트리스트에 없음'
  },
  {
    id: '10',
    timestamp: getTimestamp(12, 15), // 12시간 15분 전
    admin: 'attacker@evil.com',
    ip: '123.45.67.89',
    location: 'Unknown',
    userAgent: 'python-requests/2.25.1',
    action: 'Brute Force 시도',
    status: 'blocked',
    reason: '연속 로그인 실패'
  },
  {
    id: '11',
    timestamp: getTimestamp(15, 30), // 15시간 30분 전
    admin: 'security@company.com',
    ip: '172.16.0.50',
    location: 'Daegu, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    action: '로그 분석',
    status: 'success'
  },
  {
    id: '12',
    timestamp: getTimestamp(18, 45), // 18시간 45분 전
    admin: 'operations@company.com',
    ip: '10.0.0.25',
    location: 'Incheon, KR',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '대시보드 조회',
    status: 'success'
  },
  {
    id: '13',
    timestamp: getTimestamp(22, 20), // 22시간 20분 전
    admin: 'finance@company.com',
    ip: '192.168.1.105',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: 'SMS 인증 실패',
    status: 'failed',
    reason: '인증 시간 만료'
  },

  // 7일 이내 데이터 (24시간 초과)
  {
    id: '14',
    timestamp: getTimestamp(26, 0), // 26시간 전 (어제)
    admin: 'admin@company.com',
    ip: '192.168.1.100',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '백업 시스템 점검',
    status: 'success'
  },
  {
    id: '15',
    timestamp: getTimestamp(48, 30), // 2일 전
    admin: 'bot@spam.net',
    ip: '180.25.45.88',
    location: 'Unknown',
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    action: '자동화 도구 접근',
    status: 'blocked',
    reason: '의심스러운 User-Agent'
  },
  {
    id: '16',
    timestamp: getTimestamp(72, 15), // 3일 전
    admin: 'manager@company.com',
    ip: '203.252.33.45',
    location: 'Busan, KR',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '일일 보고서 생성',
    status: 'success'
  },
  {
    id: '17',
    timestamp: getTimestamp(96, 0), // 4일 전
    admin: 'admin@fake-domain.com',
    ip: '220.15.67.99',
    location: 'China',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    action: '지역 외 접근 시도',
    status: 'blocked',
    reason: '허용되지 않은 지역'
  },
  {
    id: '18',
    timestamp: getTimestamp(120, 30), // 5일 전
    admin: 'finance@company.com',
    ip: '192.168.1.105',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '월말 정산 처리',
    status: 'success'
  },

  // 30일 이내 데이터 (7일 초과)
  {
    id: '19',
    timestamp: getTimestamp(240, 0), // 10일 전
    admin: 'hacker@darkweb.org',
    ip: '95.142.35.67',
    location: 'Russia',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    action: '관리자 권한 탈취 시도',
    status: 'blocked',
    reason: '위험 지역 IP'
  },
  {
    id: '20',
    timestamp: getTimestamp(480, 0), // 20일 전
    admin: 'admin@company.com',
    ip: '192.168.1.100',
    location: 'Seoul, KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    action: '시스템 업데이트',
    status: 'success'
  }
]