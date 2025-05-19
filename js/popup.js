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
      proxyPElements[0].textContent = "代理IP：" + (result.proxySettings.address || '');

      // 恢复状态显示
      if (result.proxySettings.enabled) {
        proxyPElements[1].textContent = "状态：已启用";
        proxyPElements[1].classList.add('status-enabled');
        proxyPElements[1].classList.remove('status-disabled');
      } else {
        proxyPElements[1].textContent = "状态：已禁用";
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

      chrome.proxy.settings.set(
        { value: { mode: 'direct' }, scope: 'regular' },
        function () {
          chrome.storage.local.set({
            proxySettings: newSettings
          }, function () {
            // 更新代理状态显示
            const proxyPElements = document.getElementById('proxy-content').getElementsByTagName('p');
            //proxyPElements[0].textContent = "代理IP：未设置";
            proxyPElements[1].textContent = "状态：已禁用";
            proxyPElements[1].classList.add('status-disabled');
            proxyPElements[1].classList.remove('status-enabled');
            showMessage('代理已禁用', 'green');
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
      authPElements[0].textContent = "用户名：" + (result.proxyAuth.username || '未设置');
      authPElements[1].textContent = "密码：" + (result.proxyAuth.password ? '******' : '未设置');
    }
  });

  // 清除账密
  document.getElementById('clear').addEventListener('click', function () {
    if (!confirm('确定要清除已保存的代理认证信息吗？')) {
      console.log('Credentials clear canceled by user');
      return;
    }

    console.log('Clearing stored credentials...');
    chrome.storage.local.remove(['proxyAuth'], function () {
      console.log('Credentials cleared from storage');

      // 验证清除结果
      chrome.storage.local.get(['proxyAuth'], function (result) {
        console.log('Storage verification after clear:', result.proxyAuth);

        const authPElements = document.getElementById('auth-content').getElementsByTagName('p');
        if (authPElements.length >= 2) {
          authPElements[0].textContent = "用户名：未设置";
          authPElements[1].textContent = "密码：未设置";
          console.log('UI reset to default state');
        } else {
          console.error('Failed to find auth display elements');
        }

        messageDiv.textContent = '清除成功!';
        messageDiv.style.color = 'green';
        messageDiv.style.display = 'block';
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 2000);
      });
    });
  });

  // 保存账密
  saveBtn.addEventListener('click', function () {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showToast('请输入用户名和密码', 'warning')
      return;
    }

    console.log('Saving proxy credentials to storage...');
    chrome.storage.local.set({
      proxyAuth: {
        username: username,
        password: password
      }
    }, function () {
      console.log('Credentials saved successfully');

      // 验证存储结果
      chrome.storage.local.get(['proxyAuth'], function (result) {
        console.log('Retrieved saved credentials:', result.proxyAuth);

        // 更新账密显示
        const authPElements = document.getElementById('auth-content').getElementsByTagName('p');
        if (authPElements.length >= 2) {
          authPElements[0].textContent = "用户名：" + username;
          authPElements[1].textContent = "密码：******";
          console.log('UI updated with new credentials');
        } else {
          console.error('Failed to find auth display elements');
        }

        // 显示保存成功消息
        messageDiv.textContent = '保存成功!';
        messageDiv.style.display = 'block';
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 2000);

        // 清空输入框
        /*         usernameInput.value = '';
                passwordInput.value = ''; */
      });
    });
  });


  // TODO: 代理自动配置，通过对前端按钮屏蔽，此功能暂不实现
  autoProxyBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({
      type: 'GET_VERSION',
      url: 'www.example.com'
    }, (response) => {
      console.log('响应信息:', JSON.stringify(response.data, null, 2));
      if (response.error) {
        console.error('请求失败:', response.error);
        showToast('发生错误，请联系开发者', 'error');
        return;
      }
      // 新增状态判断逻辑
      if (response.data && response.data.status === 0) {
        //showToast('普通用户无法使用此功能，请手动设置IP代理', 'warning');
        saveProxyCredentials();
      } else {
        const errorMsg = response.data ?
          '登录后台系统的高级用户才可以使用此功能' : '响应数据格式异常';
        showToast(errorMsg, 'error');
      }
    });
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

  /**
   * 保存代理凭证信息
   * 通过调用接口获取代理服务器配置，并自动填充到表单输入框中
   * @function
   * @throws {Error} 当网络请求失败、接口返回异常或代理信息不完整时抛出错误
   * @example
   * saveProxyCredentials();
   */
  function saveProxyCredentials() {

    fetch('https://example.com/agent/proxy/api/query/getProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        areaCode: "henan",
        platForm: "平台凭证"
      })
    })
      .then(response => {
        if (!response.ok) throw new Error('网络响应异常');
        return response.json();
      })
      .then(data => {
        if (data.status !== 0) {
          throw new Error(data.message || '接口返回异常');
        }

        // 解析代理信息
        const { instanceIp, proxyUk, proxyPwd, proxyPort } = data.data;

        // 校验必要字段
        if (!instanceIp || !proxyPort) {
          throw new Error('代理信息不完整');
        }

        // 填充输入框
        proxyAddressInput.value = `${instanceIp}:${proxyPort}`;
        usernameInput.value = proxyUk;
        passwordInput.value = proxyPwd;

        // 自动保存设置
  /*       enableProxyBtn.click();
        saveBtn.click(); */

        showToast('代理信息获取成功', 'success');
      })
      .catch(error => {
        console.error('获取代理信息失败:', error);
        showToast(`获取失败: ${error.message}`, 'error');
      });

  }



});