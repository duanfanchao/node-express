const OrganizationTree = require('../models/OrganizationTree');

// @desc    获取组织架构
// @route   GET /api/organizationTree/getTreeInfo
exports.getOrganizationTree = async (req, res) => {
    try {
        const organizationTree = await OrganizationTree.find();
        res.status(200).json({ code: 0, data: organizationTree, resultMsg: '获取成功' });
    } catch (error) {
        console.error('获取失败:', error);
        res.status(500).json({ code: 1, data: null, resultMsg: '服务器错误' });
    }
};

// @desc    添加组织架构
// @route   POST /api/organizationTree/addTreeNode
exports.addOrganizationTree = async (req, res) => {
    try {
        const organizationTree = await OrganizationTree.create(req.body);
        res.status(200).json({ code: 0, data: organizationTree, resultMsg: '添加成功' });
    } catch (error) {
        console.error('添加失败:', error);
        res.status(500).json({ code: 1, data: null, resultMsg: '服务器错误' });
    }
}

