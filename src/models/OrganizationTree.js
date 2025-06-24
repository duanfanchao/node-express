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
    }
});

module.exports = mongoose.model('OrganizationTree', organizationTreeSchema);