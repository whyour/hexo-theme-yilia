var jsCookie = require('js-cookie')

require('badjs-report')

function getQueryString(name) { 
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r != null) return unescape(r[2]); return null; 
} 
// 统计用，开发者不需要理会
// if (window.BJ_REPORT) {
if (false) {	
	BJ_REPORT.init({
  		id: 1
	});
	BJ_REPORT.init({
		id: 1,                                
		uin: window.location.origin,          
		combo: 0,                             
		delay: 1000,                          
		url: "//litten.me:9005/badjs/",       
		ignore: [/Script error/i],           
		random: 1,                            
		repeat: 500000,                         
		onReport: function(id, errObj){},    
		ext: {}                             
	});
	// iframe不上报
	var host = window.location.host
	var isNotFrame = (top === window)
	var isNotLocal = !((/localhost/i.test(host) || /127.0.0.1/i.test(host) || /0.0.0.0/i.test(host)))
	isNotFrame && isNotLocal && BJ_REPORT.report('yilia-' + window.location.host)

	// 来源上报
	var from = getQueryString('f');
	var fromKey = 'yilia-from';
	if (from) {
		isNotFrame && BJ_REPORT.report('from-' + from);
		// 种cookie
		jsCookie.set(fromKey, from);
	} else {
		if (document.referrer.indexOf(window.location.host) >= 0) {
			// 取cookie
			from = jsCookie.get(fromKey);
			from && isNotFrame && BJ_REPORT.report('from-' + from);
		} else {
			// 清cookie
			jsCookie.remove(fromKey);
		}
	}
}

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