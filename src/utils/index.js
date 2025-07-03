function transformData(data) {
    const map = new Map();
    const result = [];

    // 将数据按 parentId 分组
    data.forEach(item => {
        if (!map.has(item.parentId)) {
            map.set(item.parentId, []);
        }
        map.get(item.parentId).push(item);
    });

    // 递归构建层级结构
    function buildHierarchy(parentId, path = []) {
        const children = map.get(parentId) || [];
        children.forEach(child => {
            const newPath = [...path, child.name, child.id];
            if (child.level === 3) {
                // 如果是第三级，将完整路径生成期望的结构
                result.push({
                    firstOrganizationName: path[0],
                    firstOrganizationId: path[1],
                    secondOrganizationName: path[2] || '',
                    secondOrganizationId: path[3] || '',
                    thirdOrganizationName: child.name || '',
                    id: child.id,
                    parentId: child.parentId,
                    level: child.level
                });
            }
            // 递归构建
            buildHierarchy(child.id, newPath);
        });
    }

    // 从根节点（parentId === null）开始构建
    buildHierarchy(null);

    return result;
}

exports.transformData = transformData;