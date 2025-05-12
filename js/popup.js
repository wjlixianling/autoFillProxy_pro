document.addEventListener('DOMContentLoaded', function() {
  const saveBtn = document.getElementById('save');
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