
/**
 * 检查代理设置状态
 * @returns {Promise<boolean>} - 返回代理是否启用的Promise
 */
function checkProxySettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['proxySettings'], function(result) {
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

/**
 * 代理认证请求处理器
 * 监听所有需要代理认证的网络请求,从本地存储获取代理凭据并自动填充
 * 
 * @param {object} details - 认证请求的详细信息
 * @returns {Promise<object>} - 返回认证结果的Promise
 * 
 * @listens chrome.webRequest.onAuthRequired
 */
chrome.webRequest.onAuthRequired.addListener(
  function(details) {
    return new Promise((resolve) => {
      console.log("Handling authentication request for:", details.url);
      
      checkProxySettings().then((isProxyEnabled) => {
        if (!isProxyEnabled) {
          resolve({cancel: true});
          return;
        }
        
        chrome.storage.local.get(['proxyAuth'], function(result) {
          if (result.proxyAuth && result.proxyAuth.username && result.proxyAuth.password) {
            console.log("Using proxy credentials:", result.proxyAuth.username);
            resolve({
              authCredentials: {
                username: result.proxyAuth.username,
                password: result.proxyAuth.password
              }
            });
          } else {
            console.log("No proxy credentials found");
            resolve({cancel: true});
          }
        });
      });
    });
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);