const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    hashPassword: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

// 保存前加密密码
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // 保存原始密码
    this.hashPassword = await bcrypt.hash(this.password, 10);
    next();
});

// 验证密码
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.hashPassword);
};

module.exports = mongoose.model('User', userSchema);