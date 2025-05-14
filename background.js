
/**
 * 检查代理设置状态
 * @returns {Promise<boolean>} - 返回代理是否启用的Promise
 */
function checkProxySettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['proxySettings'], function (result) {
      console.log('Retrieved proxy settings from storage:', result.proxySettings);

      if (!result.proxySettings || !result.proxySettings.enabled) {
        console.log("Proxy is not enabled");
        resolve(false);
        return;
      }

      if (!result.proxySettings.address) {
        console.log("Proxy address not set");
        resolve(false);
        return;
      }

      console.log("Proxy is properly configured");
      resolve(true);
    });
  });
}


// 保存的凭据
let currentCredentials = {};

// 1. 初始化加载凭据
chrome.storage.local.get(['proxyAuth'], (result) => {
  currentCredentials = result.proxyAuth || {};
});

// 2. 监听凭据更新
chrome.storage.onChanged.addListener((changes) => {
  if (changes.proxyAuth) {
    currentCredentials = changes.proxyAuth.newValue || {};
  }
});

// 3. 认证拦截器
chrome.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    if (currentCredentials.username && currentCredentials.password) {
      callback({
        authCredentials: {
          username: currentCredentials.username,
          password: currentCredentials.password
        }
      });
    } else {
      callback({ cancel: true }); // 无有效凭据时取消请求
    }
  },
  { urls: ["<all_urls>"] },
  ['asyncBlocking'] // 必须声明异步阻塞模式
);

// 发送请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_VERSION') {
        fetch(request.url, {
            credentials: 'include' // 携带cookie
        })
        .then(res => res.json())
        .then(data => sendResponse({ data }))
        .catch(error => sendResponse({ error: error.message }));
        return true; // 保持消息通道开放
    }
});



