const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// CORS 설정
server.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 기본 미들웨어 사용 (logger, static, cors 등)
server.use(middlewares);

// JSON 파싱
server.use(jsonServer.bodyParser);

// 커스텀 라우트 (로그인 시뮬레이션)
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  // db.json에서 사용자 찾기
  const db = router.db;
  const user = db.get('users').find({ email }).value();

  if (!user) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ error: '비활성화된 계정입니다.' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({ error: '승인 대기 중인 계정입니다.' });
  }

  // 실제로는 비밀번호 검증이 필요하지만, 목업이므로 생략
  // lastLogin 업데이트
  db.get('users')
    .find({ id: user.id })
    .assign({ lastLogin: new Date().toISOString() })
    .write();

  res.json({
    success: true,
    user: {
      ...user,
      lastLogin: new Date().toISOString()
    },
    token: 'mock-jwt-token-' + user.id
  });
});

// 기본 라우터 사용
server.use(router);

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /users');
  console.log('  GET    /users/:id');
  console.log('  POST   /users');
  console.log('  PUT    /users/:id');
  console.log('  PATCH  /users/:id');
  console.log('  DELETE /users/:id');
  console.log('  POST   /auth/login');
});
