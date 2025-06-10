require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./db/connect');

const app = express();


// 全局中间件
app.use(helmet()); // 安全防护
app.use(morgan('dev')); // 开发环境日志
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
  credentials: true
}));
app.use(bodyParser.json());

// 连接数据库
connectDB();

// 健康检查路由
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK' });
// });

// API路由
app.use(`${process.env.BASE_API}/auth`, authRoutes);

// 404处理
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;