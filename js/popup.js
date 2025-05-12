document.addEventListener('DOMContentLoaded', function() {
  // 代理设置相关元素
  const proxyAddressInput = document.getElementById('proxyAddress');
  const enableProxyBtn = document.getElementById('enableProxy');
  const disableProxyBtn = document.getElementById('disableProxy');

  // 账密设置相关元素
  const saveBtn = document.getElementById('save');
  
  // 加载保存的代理设置
  chrome.storage.local.get(['proxySettings'], function(result) {
    if (result.proxySettings && result.proxySettings.address) {
      proxyAddressInput.value = result.proxySettings.address;
    }
  });

  // 启用代理
  enableProxyBtn.addEventListener('click', function() {
    // 检查chrome.proxy API是否可用
    if (!chrome.proxy || !chrome.proxy.settings) {
      alert('代理功能不可用，请确保:\n1. 扩展已正确加载\n2. manifest.json中包含proxy权限\n3. 使用最新版Chrome浏览器');
      return;
    }

    const proxyAddress = proxyAddressInput.value.trim();
    
    if (!proxyAddress) {
      alert('请输入代理地址(格式: ip:端口)');
      return;
    }
    
    // 验证IP:端口格式
    const parts = proxyAddress.split(':');
    if (parts.length !== 2 || isNaN(parts[1]) || parts[1] < 1 || parts[1] > 65535) {
      alert('代理地址格式不正确，请使用 ip:端口 格式');
      return;
    }

    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: 'http',
          host: parts[0],
          port: parseInt(parts[1])
        }
      }
    };

    chrome.proxy.settings.set(
      {value: config, scope: 'regular'},
      function() {
        console.log('Proxy settings applied:', config);
        // 保存设置
        chrome.storage.local.set({
          proxySettings: {
            address: proxyAddress,
            enabled: true
          }
        }, function() {
          console.log('Proxy settings saved to storage');
          showMessage('代理已启用', 'green');
          
          // 验证设置是否生效
          chrome.proxy.settings.get({}, function(details) {
            console.log('Current proxy settings:', details);
          });
        });
      }
    );
  });

  // 禁用代理
  disableProxyBtn.addEventListener('click', function() {
    chrome.proxy.settings.set(
      {value: {mode: 'direct'}, scope: 'regular'},
      function() {
        chrome.storage.local.set({
          proxySettings: {
            enabled: false
          }
        }, function() {
          showMessage('代理已禁用', 'green');
        });
      }
    );
  });

  // 显示消息的辅助函数
  function showMessage(msg, color) {
    messageDiv.textContent = msg;
    messageDiv.style.color = color;
    messageDiv.style.display = 'block';
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 2000);
  }
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const contentDiv = document.getElementById('content');
  const messageDiv = document.getElementById('message');

  // 加载已保存的账密
  chrome.storage.local.get(['proxyAuth'], function(result) {
    if (result.proxyAuth) {
      const pElements = contentDiv.getElementsByTagName('p');
      pElements[0].textContent = result.proxyAuth.username || '未设置';
      pElements[1].textContent = result.proxyAuth.password ? '******' : '未设置';
    }
  });

  // 清除账密
  document.getElementById('clear').addEventListener('click', function() {
    if (!confirm('确定要清除已保存的代理认证信息吗？')) {
      return;
    }
    
    chrome.storage.local.remove(['proxyAuth'], function() {
      const pElements = contentDiv.getElementsByTagName('p');
      pElements[0].textContent = '未设置';
      pElements[1].textContent = '未设置';
      
      messageDiv.textContent = '清除成功!';
      messageDiv.style.color = 'green';
      messageDiv.style.display = 'block';
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 2000);
    });
  });

  // 保存账密
  saveBtn.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert('请输入用户名和密码');
      return;
    }

    chrome.storage.local.set({
      proxyAuth: {
        username: username,
        password: password
      }
    }, function() {
      // 更新显示
      const pElements = contentDiv.getElementsByTagName('p');
      pElements[0].textContent = username;
      pElements[1].textContent = '******';
      
      // 显示保存成功消息
      messageDiv.style.display = 'block';
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 2000);
      
      // 清空输入框
      usernameInput.value = '';
      passwordInput.value = '';
    });
  });
});