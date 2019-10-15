// 注册 ServiceWorker
function regSW() {
    if ('serviceWorker' in navigator) {
        // 注册
        navigator.serviceWorker
            .register('/sw.js', {scope: '/'})
            .then( function(registration) {
                console.log('ServiceWorker 注册成功！作用域为: ', registration.scope);
            })
            .catch(function(err) {
                console.log('ServiceWorker 注册失败: ', err);
            });

        // SW 消息处理
        navigator.serviceWorker.ready.then(function(reg) {
            if (!window.Notification || !window.MessageChannel) {
                return;
            }
            console.log('reg: ',reg)
            // 建立一个消息管道，用于当前页面与 SW 之间的消息传递，也便于 SW 知道该消息的来源
            var channel = new window.MessageChannel();

            channel.port1.onmessage = function(e) {
                console.log('get Message: ', e.data);
                if (!e.data) {
                    return;
                }

                // 要求申请通知权限
                if (e.data.type === 'applyNotify') {
                    window.Notification.requestPermission().then(function(grant) {
                        if (grant !== 'granted') {
                            console.log('申请通知权限被拒绝了！')
                            return;
                        }

                        if(navigator.serviceWorker.controller)
                            navigator.serviceWorker.controller.postMessage({type: 'notify', info: e.data.info}, [channel.port2]);
                    });
                }
            }

            if(navigator.serviceWorker.controller)
                navigator.serviceWorker.controller.postMessage('hello', [channel.port2]);
        });

        // 掉线通知示例
        window.addEventListener('offline', function() {
            Notification.requestPermission().then(function (grant) {
                if (grant !== 'granted') {
                    return;
                }

                var notification = new Notification("Hi，网络不给力哟", {
                    body: '您的网络貌似离线了，不过页面还可以继续打开~',
                    icon: '/uploads/logo.png'
                });

                notification.onclick = function() {
                    notification.close();
                };
            });
        })
    }
}

regSW();

module.exports = {
	init: function() {}
}
