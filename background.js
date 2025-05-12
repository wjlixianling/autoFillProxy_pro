chrome.webRequest.onAuthRequired.addListener(
  function(details, callback) {
    console.log("Handling authentication request");
    
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
    
    return {cancel: false}; // 保持请求挂起直到回调完成
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);