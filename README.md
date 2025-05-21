代理设置助手项目说明文档

一、项目概述
代理设置助手是一个基于Chrome浏览器扩展的工具，旨在实现代理配置的自动化管理。该扩展通过简化代理服务器的配置流程，提供一键启用/禁用功能，并支持代理状态的持久化存储，帮助用户更高效地管理网络代理设置。

二、主要功能
1. 代理服务器管理
  ○ 支持HTTP代理地址配置（格式：ip:port）
  ○ 提供一键启用/重置代理功能
  ○ 代理状态持久化存储（使用chrome.storage.local）
2. 认证凭据管理
  ○ 代理用户名/密码的安全存储
  ○ 凭据自动填充（通过webRequest.onAuthRequired拦截）
  ○ 敏感信息加密存储（基于Chrome原生存储机制）
3. 智能辅助功能
  ○ 自动检测代理配置的有效性
  ○ 网络请求拦截规则管理（基于declarativeNetRequest API）
  ○ 系统权限检测与错误提示

三、技术架构
代理设置助手采用MV3（Manifest V3）扩展架构，分为以下三个主要模块：
1. 核心层（background.js）
  ○ 代理状态机管理
  ○ 认证拦截器
  ○ 跨组件通信总线
2. 表现层（popup）
  ○ 配置界面（popup.html）
  ○ 交互逻辑（popup.js）
  ○ 状态可视化
3. 配置层
  ○ 清单文件（manifest.json）
  ○ 网络规则集（rules.json）

四、核心实现
1. 代理管理子系统
  ○ 地址格式验证（基于正则表达式）
  ○ 使用chrome.proxy.settings API控制代理设置
  ○ 设置状态同步（localStorage ↔ Chrome运行时）
2. 认证子系统
  ○ 安全凭证存储（隔离存储空间）
  ○ 请求拦截模式（asyncBlocking模式）
  ○ JWT自动续期检测（通过Cookie解析）
3. 通信机制
  ○ 跨组件消息总线（runtime.sendMessage）
  ○ 存储变更监听（storage.onChanged）
  ○ 统一错误处理链路

五、安全规范
1. 严格遵循Chrome扩展安全策略
2. 敏感操作（如凭据清除）需二次确认
3. 采用最小权限原则（精确声明host_permissions）
4. 存储数据加密（基于Chrome原生加密机制）

六、安装与使用
1. 安装步骤
  ○ 下载压缩包或克隆项目
  ○ 在Chrome地址栏访问 chrome://extensions
  ○ 启用“开发者模式”
  ○ 点击“加载已解压的扩展程序”
  ○ 选择项目根目录或者直接将zip压缩包拖入当前页面
2. 注意事项
  ○ 本插件没有Chrome Web Store分发，不提供crx格式
  ○ 本地加载仅限开发环境使用
  ○ 本插件仅提供设置IP功能，不提供任何IP资源

