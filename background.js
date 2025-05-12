
/**
 * 检查代理设置状态
 * @param {function} callback - 返回代理是否启用的回调
 */
function checkProxySettings(callback) {
  chrome.storage.local.get(['proxySettings'], function(result) {
    console.log('Retrieved proxy settings from storage:', result.proxySettings);
    
    if (!result.proxySettings || !result.proxySettings.enabled) {
      console.log("Proxy is not enabled");
      callback(false);
      return;
    }
    
    if (!result.proxySettings.address) {
      console.log("Proxy address not set");
      callback(false);
      return;
    }
    
    console.log("Proxy is properly configured");
    callback(true);
  });
}

/**
 * 代理认证请求处理器
 * 监听所有需要代理认证的网络请求,从本地存储获取代理凭据并自动填充
 * 
 * @param {object} details - 认证请求的详细信息
 * @param {function} callback - 处理认证的回调函数
 * - 如果存在代理凭据,使用存储的用户名和密码进行认证
 * - 如果没有找到凭据,取消该请求
 * 
 * @listens chrome.webRequest.onAuthRequired
 * @returns {object} - 返回 {cancel: false} 以保持请求挂起直到回调完成
 */
chrome.webRequest.onAuthRequired.addListener(
  function(details, callback) {
    console.log("Handling authentication request");
    
    checkProxySettings(function(isProxyEnabled) {
      if (!isProxyEnabled) {
        callback({cancel: true});
        return;
      }
      
      chrome.storage.local.get(['proxyAuth'], function(result) {
        if (result.proxyAuth && result.proxyAuth.username && result.proxyAuth.password) {
          callback({
            authCredentials: {
              username: result.proxyAuth.username,
              password: result.proxyAuth.password
            }
          });
        } else {
          console.log("No proxy credentials found");
          callback({cancel: true});
        }
      });
    });
    
    return {cancel: false};
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);