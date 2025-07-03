const mongoose = require('mongoose');

const organizationTreeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    parentId: {
        type: String,
        required: false,
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    level: { type: Number, required: true },
    organizationTree: { type: Array, default: [] }
}, {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
});

module.exports = mongoose.model('organizationTree', organizationTreeSchema, 'organizationtree');