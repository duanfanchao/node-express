const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const {
    getOrganizationTree,
    addOrganizationTree,
    editOrganizationTreeNode,
    deleteOrganizationTreeNode,
    getOrganizationLevelData,
} = require('../controllers/organizationTreeController');

// 注册路由
router.get('/getOrganizationTree', authMiddleware, getOrganizationTree);
router.post('/addTreeNode', authMiddleware, addOrganizationTree);
router.post('/editTreeNode', authMiddleware, editOrganizationTreeNode);
router.post('/deleteTreeNode', authMiddleware, deleteOrganizationTreeNode);
router.get('/getTreeLevelData', authMiddleware, getOrganizationLevelData);

module.exports = router;
