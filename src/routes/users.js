const express = require('express');
const router = express.Router();

// 数据验证中间件
const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Validation Error',
      message: 'Name and email are required'
    });
  }
  next();
};

// 用户数据存储
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
];

// 获取所有用户
router.get('/', (req, res) => {
  res.json({
    data: users,
    meta: {
      count: users.length,
      timestamp: new Date().toISOString()
    }
  });
});

// 获取单个用户
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${req.params.id} not found`
    });
  }
  res.json({ data: user });
});

// 创建用户
router.post('/', validateUser, (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  res.status(201).json({ data: newUser });
});

// 更新用户
router.put('/:id', validateUser, (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${req.params.id} not found`
    });
  }

  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  res.json({ data: updatedUser });
});

// 删除用户
router.delete('/:id', (req, res) => {
  const initialLength = users.length;
  users = users.filter(u => u.id !== parseInt(req.params.id));
  
  if (users.length === initialLength) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${req.params.id} not found`
    });
  }

  res.status(204).end();
});

module.exports = router;