// 发布新密码
function publishNewPassword(bookcaseId, password) {
    try {
        // 更安全的频道名称
        const channel = ably.channels.get(`bookcase-${bookcaseId}-pw`);
        channel.publish('new-password', password);
        console.log(`已发布书柜 ${bookcaseId} 的新密码: ${password}`);
    } catch (error) {
        console.error('发布密码更新错误:', error);
        alert('密码发布失败，请重试');
    }
}

// 订阅密码更新
function subscribeToPasswordUpdates(bookcaseId, callback) {
    try {
        // 更安全的频道名称
        const channel = ably.channels.get(`bookcase-${bookcaseId}-pw`);
        channel.subscribe('new-password', (message) => {
            console.log(`收到书柜 ${bookcaseId} 密码更新: ${message.data}`);
            callback(message);
        });
    } catch (error) {
        console.error('订阅密码更新错误:', error);
        alert('密码订阅失败，请重试');
    }
}