const OrganizationTree = require('../models/OrganizationTree');
const { transformData } = require('../utils/index');
const { v4: uuidv4 } = require('uuid');

// @desc    获取组织架构
// @route   GET /api/organizationTree/getTreeInfo
exports.getOrganizationTree = async (req, res) => {
    const { name } = req.query;
    try {
        const tree = await OrganizationTree.find();
        const list = transformData(tree[0].organizationTree).filter(ele => name ? ele.thirdOrganizationName.includes(name) : true);
        res.status(200).json({ code: 0, data: list, resultMsg: '获取成功' });
    } catch (error) {
        console.error('获取失败:', error);
        res.status(500).json({ code: 1, data: null, resultMsg: '服务器错误' });
    }
};

// @desc    添加组织架构
// @route   POST /api/organizationTree/addTreeNode
exports.addOrganizationTree = async (req, res) => {
    const { firstOrganizationId, secondOrganizationId, thirdOrganizationName } = req.body;
    if (!firstOrganizationId) {
        return res.status(200).json({ code: 1, data: null, resultMsg: '第一级组织不能为空!' })
    }
    if (!secondOrganizationId) {
        return res.status(200).json({ code: 1, data: null, resultMsg: '第二级组织不能为空!' })
    }
    if (!thirdOrganizationName) {
        return res.status(200).json({ code: 1, data: null, resultMsg: '第三级组织名称不能为空!' })
    }
    try {
        const firstOrg = await OrganizationTree.findOne({ 'organizationTree.id': firstOrganizationId });
        if (!firstOrg) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '第一级组织不存在!' });
        }
        const secondOrg = await OrganizationTree.findOne({ 'organizationTree.id': secondOrganizationId });
        if (!secondOrg) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '第二级组织不存在!' });
        }
        // 使用 UUID 生成主键
        const id = uuidv4();
        // 4. 创建新组织节点
        const newOrg = {
            name: thirdOrganizationName,
            parentId: secondOrganizationId,
            id,
            level: 3
        };
        const doc = await OrganizationTree.findOne({
            'organizationTree.id': secondOrganizationId
        });
        // 5. 更新文档
        const result = await OrganizationTree.updateOne(
            { _id: doc._id },
            {
                $push: { organizationTree: newOrg },
                $set: { updatedAt: new Date() }
            }
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({ code: 0, data: newOrg, resultMsg: '添加成功' });
        } else {
            res.status(200).json({ code: 1, data: null, resultMsg: '添加失败，文档未更新' });
        }
    } catch (error) {
        console.error('添加失败:', error);
        res.status(500).json({ code: 1, data: null, resultMsg: '服务器错误' });
    }
}

// @desc    编辑组织架构
// @route   POST /api/organizationTree/editTreeNode
exports.editOrganizationTreeNode = async (req, res) => {
    const { id, name } = req.body;
    if (!name) {
        return res.status(200).json({ code: 1, data: null, resultMsg: '部门名称不能为空!' })
    }
    try {
        // 1. 查找包含目标节点的文档
        const doc = await OrganizationTree.findOne({
            'organizationTree.id': id
        });
        // 2. 更新数组中的特定节点
        const updated = await OrganizationTree.updateOne(
            { _id: doc._id, 'organizationTree.id': id },
            { $set: { 'organizationTree.$.name': name } }
        );
        if (updated.modifiedCount === 0) {
            return res.status(200).json({ code: 1, data: null, resultMsg: '节点未更新，可能未找到匹配项' });
        }
        // 3. 返回更新后的文档
        const updatedDoc = await OrganizationTree.findById(doc._id);
        res.status(200).json({
            code: 0,
            resultMsg: '节点更新成功',
            data: updatedDoc.organizationTree.find(item => item.id === id)
        });
    } catch (error) {
        console.log('error', error);
    }
}

// @desc    删除组织树叶子节点
// @route   POST /api/organizationTree/deleteTreeNode
exports.deleteOrganizationTreeNode = async (req, res) => {
    try {
        const { id } = req.body;

        // 验证ID是否为空
        if (!id) {
            return res.status(400).json({
                code: 1,
                data: null,
                resultMsg: '部门id不能为空!'
            });
        }
        // 查找要删除的节点
        const nodeToDelete = await OrganizationTree.findOne({ 'organizationTree.id': id });
        // 检查节点是否存在
        if (!nodeToDelete) {
            return res.status(200).json({
                code: 1,
                data: null,
                resultMsg: '未找到指定的部门节点!'
            });
        }
        // 删除节点
        await OrganizationTree.updateOne(
            { _id: nodeToDelete._id },
            { $pull: { organizationTree: { id: id } } }
        );
        return res.status(200).json({
            code: 0,
            data: null,
            resultMsg: '部门节点删除成功!'
        });
    } catch (error) {
        console.log('error', error);
    }
}

// @desc    获取组织树层级节点数据
// @route   POST /api/organizationTree/getOrganizationTree
exports.getOrganizationLevelData = async (req, res) => {
    try {
        const treeJson = await OrganizationTree.find();
        const treeNodeList = treeJson[0].organizationTree;
        let firstLevel, secondLevel, thirdLevel = [];
        if (treeNodeList) {
            firstLevel = treeNodeList.filter(ele => ele.level === 1);
            secondLevel = treeNodeList.filter(ele => ele.level === 2);
            thirdLevel = treeNodeList.filter(ele => ele.level === 3);
        } else {
            firstLevel = [];
            secondLevel = [];
            thirdLevel = [];
        }
        res.status(200).json({ code: 0, data: { firstLevel, secondLevel, thirdLevel }, resultMsg: '获取成功' });
    } catch (error) {
        console.log('error', error);
    }
}

