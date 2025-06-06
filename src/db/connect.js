const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB连接成功');
    } catch (error) {
        console.error('MongoDB连接失败:', error.message);
        process.exit(1); // 退出进程
    }
};

module.exports = connectDB;