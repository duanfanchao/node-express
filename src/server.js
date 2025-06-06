const http = require('http');
const app = require('./app');  // 引入 app.js 中定义的 Express 应用
const PORT = process.env.PORT || 3002;

// 创建 HTTP 服务器并启动监听
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});