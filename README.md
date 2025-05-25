# SayHi DApp 🌟

一个基于区块链的简单问候应用，允许用户发送消息并可选择性地进行ETH转账。

## 📋 项目概述

SayHi DApp是一个去中心化应用，使用Solidity智能合约存储消息，并通过现代化的Web界面与区块链交互。用户可以发送消息、查看历史记录，并支持同时进行ETH转账。

## ✨ 主要功能

- 🔗 **钱包连接** - 一键连接MetaMask钱包
- 💬 **发送消息** - 将消息永久存储在区块链上
- 💰 **ETH转账** - 发送消息时可选择性转账
- 📊 **统计信息** - 实时显示合约数据
- 📝 **消息历史** - 查看所有历史消息
- 🎨 **现代化UI** - 响应式设计，支持移动端

## 🛠️ 技术栈

### 智能合约
- **Solidity** - 合约开发语言
- **Truffle** - 开发框架
- **Ganache** - 本地区块链

### 前端
- **HTML5/CSS3** - 界面结构和样式
- **jQuery** - DOM操作和事件处理
- **Ethers.js v6** - 区块链交互库
- **MetaMask** - 钱包连接

## 📁 项目结构

```
truffle-dapp/
├── contracts/
│   └── SayHi.sol              # 智能合约源码
├── migrations/
│   └── 1_deploy_contracts.js  # 部署脚本
├── build/contracts/
│   └── SayHi.json            # 编译后的合约ABI
├── sayhi-dapp.html           # DApp界面文件
├── FirstContract.json        # 合约ABI（用于前端）
├── truffle-config.js         # Truffle配置
└── README.md                 # 项目说明
```

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) (v14.0.0+)
- [MetaMask](https://metamask.io/) 浏览器扩展
- [Truffle](https://trufflesuite.com/) 开发框架

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd sayhi-dapp
   ```

2. **安装依赖**
   ```bash
   npm install -g truffle
   npm install
   ```

3. **启动本地区块链**
   ```bash
   # 新终端窗口
   ganache-cli
   ```

4. **编译和部署合约**
   ```bash
   truffle compile
   truffle migrate --network development
   ```

5. **复制合约ABI**
   ```bash
   cp build/contracts/SayHi.json ./FirstContract.json
   ```

6. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server
   ```

7. **配置MetaMask**
   - 添加本地网络: `http://127.0.0.1:8545`
   - 链ID: `1337`
   - 导入Ganache提供的测试账户

8. **访问应用**
   - 打开浏览器访问: `http://localhost:8000/sayhi-dapp.html`

## 🔧 配置说明

### MetaMask网络配置

**本地开发网络**
- 网络名称: `Localhost 8545`
- RPC URL: `http://127.0.0.1:8545`
- 链ID: `1337`
- 货币符号: `ETH`

### 合约配置

在 `sayhi-dapp.html` 中更新合约地址：
```javascript
const CONTRACT_ADDRESS = "你的合约地址";
```

## 📖 使用指南

### 基本操作

1. **连接钱包**
   - 点击"连接 MetaMask"按钮
   - 在MetaMask中确认连接

2. **发送消息**
   - 输入消息内容
   - （可选）输入ETH转账金额
   - 点击"🚀 直接调用 sayHi"按钮
   - 在MetaMask中确认交易

3. **查看统计**
   - 自动显示总消息数
   - 显示合约余额
   - 显示个人消息数量

4. **查看历史**
   - 点击"加载所有消息"查看历史记录

### 调试功能

- 点击"调试信息"查看连接状态
- 检查控制台获取详细日志
- 验证网络和合约部署状态

## 🎯 智能合约功能

### 主要函数

- `sayHi(string _message)` - 发送消息（支持转账）
- `getMessage(uint256 _index)` - 获取指定消息
- `getLatestMessage()` - 获取最新消息
- `getTotalMessages()` - 获取消息总数
- `getContractBalance()` - 获取合约余额

### 事件

- `MessageSent(address sender, string message, uint256 amount)` - 消息发送事件

## 🔍 故障排除

### 常见问题

1. **钱包连接失败**
   - 确保MetaMask已安装并解锁
   - 检查网络配置是否正确

2. **合约调用失败**
   - 验证合约地址是否正确
   - 确保连接到正确的网络
   - 检查账户余额是否充足

3. **交易失败**
   - 增加Gas限制
   - 检查网络拥堵情况
   - 重新尝试交易

### 调试技巧

- 打开浏览器开发者工具查看控制台日志
- 使用"调试信息"功能检查状态
- 在区块链浏览器中验证交易

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题或建议，请联系项目维护者。

---

**注意**: 这是一个演示项目，请勿在主网上使用未经审计的合约。