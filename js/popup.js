document.addEventListener('DOMContentLoaded', function () {
  // 代理设置相关元素
  const proxyAddressInput = document.getElementById('proxyAddress');
  const enableProxyBtn = document.getElementById('enableProxy');
  const disableProxyBtn = document.getElementById('disableProxy');

  // 账密设置相关元素
  const saveBtn = document.getElementById('save');
  const autoProxyBtn = document.getElementById('autoProxy');

  // 加载保存的代理设置
  chrome.storage.local.get(['proxySettings'], function (result) {
    const proxyPElements = document.getElementById('proxy-content').getElementsByTagName('p');

    if (result.proxySettings) {
      // 恢复代理地址输入框
      proxyAddressInput.value = result.proxySettings.address || '';

      // 恢复状态显示
      if (result.proxySettings.enabled) {
        proxyPElements[1].textContent = "状态：已启用";
        proxyPElements[0].textContent = "代理IP：" + result.proxySettings.address;
        proxyPElements[1].classList.add('status-enabled');
        proxyPElements[1].classList.remove('status-disabled');
      } else {
        proxyPElements[1].textContent = "状态：已停用";
        proxyPElements[1].classList.add('status-disabled');
        proxyPElements[1].classList.remove('status-enabled');
      }
    } else {
      // 默认状态
      proxyPElements[0].textContent = "代理IP：未设置";
      proxyPElements[1].textContent = "状态：未启用";
      proxyPElements[1].classList.remove('status-enabled', 'status-disabled');
    }
  });


  // 保存账密设置
  // 默认账号和密码
  const defaultUsername = 'kgproxy1';
  const defaultPassword = '7X9aB2y';

  // 保存默认账号和密码
  chrome.storage.local.set({
    proxyAuth: {
      username: defaultUsername,
      password: defaultPassword
    }
  }, function () {
    console.log('Default credentials saved successfully');

    // 更新账密显示
    const authPElements = document.getElementById('auth-content').getElementsByTagName('p');
    if (authPElements.length >= 2) {
      authPElements[0].textContent = "用户名：*****";
      authPElements[1].textContent = "密码：******";
      console.log('UI updated with default credentials');
    } else {
      console.error('Failed to find auth display elements');
    }
  });



  // 启用代理
  enableProxyBtn.addEventListener('click', function () {
    // 检查chrome.proxy API是否可用
    if (!chrome.proxy || !chrome.proxy.settings) {
      showToast('代理功能不可用，请确保:\n1. 扩展已正确加载\n2. manifest.json中包含proxy权限\n3. 使用最新版Chrome浏览器', 'error');
      return;
    }

    const proxyAddress = proxyAddressInput.value.trim();

    if (!proxyAddress) {
      showToast('请输入代理地址(格式: ip:端口)', 'warning');
      return;
    }

    // 验证IP:端口格式
    const parts = proxyAddress.split(':');
    if (parts.length !== 2 || isNaN(parts[1]) || parts[1] < 1 || parts[1] > 65535) {
      showToast('代理地址格式不正确，请使用 ip:端口 格式', 'error');
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
      { value: config, scope: 'regular' },
      function () {
        console.log('Proxy settings applied:', config);
        // 保存设置
        chrome.storage.local.set({
          proxySettings: {
            address: proxyAddress,
            enabled: true
          }
        }, function () {
          console.log('Proxy settings saved to storage');
          showMessage('代理已启用', 'green');

          // 更新代理状态显示
          const proxyPElements = document.getElementById('proxy-content').getElementsByTagName('p');
          proxyPElements[0].textContent = "代理IP：" + proxyAddress;
          proxyPElements[1].textContent = "状态：已启用";
          proxyPElements[1].classList.add('status-enabled');
          proxyPElements[1].classList.remove('status-disabled');

          // 验证设置是否生效
          chrome.proxy.settings.get({}, function (details) {
            console.log('Current proxy settings:', details);
          });
        });
      }
    );
  });

  // 禁用代理
  disableProxyBtn.addEventListener('click', function () {

    chrome.storage.local.get(['proxySettings'], function (result) {
      const settings = result.proxySettings || {};

      // 保留原有代理地址
      const newSettings = {
        ...settings,  // 保留所有现有设置
        enabled: false  // 仅修改启用状态
      };

      chrome.proxy.settings.clear({},
        function () {
          chrome.storage.local.set({
            proxySettings: newSettings
          }, function () {
            // 更新代理状态显示
            const proxyPElements = document.getElementById('proxy-content').getElementsByTagName('p');
            proxyPElements[0].textContent = "代理IP：未设置";
            proxyPElements[1].textContent = "状态：已停用";
            proxyPElements[1].classList.add('status-disabled');
            proxyPElements[1].classList.remove('status-enabled');
            showToast('已恢复代理设置到初始状态', 'success');
          });
        }
      );
    });
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
  const messageDiv = document.getElementById('message');

  // 加载已保存的账密
  chrome.storage.local.get(['proxyAuth'], function (result) {
    if (result.proxyAuth) {
      const authPElements = document.getElementById('auth-content').getElementsByTagName('p');
      authPElements[0].textContent = "用户名：" + (result.proxyAuth.username ? '******' : '未设置');
      authPElements[1].textContent = "密码：" + (result.proxyAuth.password ? '******' : '未设置');
    }
  });

 




  /**
   * 显示 toast 提示信息
   * @param {string} message - 要显示的提示信息内容
   * @param {string} [type='info'] - 提示类型，默认为 'info'
   * @description 在页面显示一个持续3秒的 toast 提示，支持通过 type 参数指定不同样式
   */
  function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast'; // 重置类名
    toast.classList.add('show', type);

    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

});