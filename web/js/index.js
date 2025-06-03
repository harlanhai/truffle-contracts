// 合约配置
const CONTRACT_ADDRESS = '0x99990E577e5b8565fE2Ad0cB1eA3EaD734cBD8D5';
let CONTRACT_ABI = null; // 将从JSON文件加载

// 全局变量
let provider;
let signer;
let contract;
let userAccount;

// 加载合约ABI
async function loadContractABI() {
  try {
    console.log('正在加载合约ABI...');
    const response = await fetch('./SayHi.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contractJson = await response.json();
    CONTRACT_ABI = contractJson.abi;

    console.log('ABI加载成功:', CONTRACT_ABI);
    return true;
  } catch (error) {
    console.error('加载ABI失败:', error);
    showStatus('walletStatus', 'info', 'ABI加载失败，使用备用ABI。请确保FirstContract.json文件在同一目录下。');
    return false;
  }
}

// 初始化
$(document).ready(async function () {
  // 首先加载ABI
  const abiLoaded = await loadContractABI();

  if (abiLoaded) {
    showStatus('walletStatus', 'success', 'ABI加载成功，请连接MetaMask钱包');
  }

  checkMetaMaskInstallation();
  setupEventListeners();
  checkExistingConnection();
});

// 检查是否已经连接
async function checkExistingConnection() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        console.log('检测到已连接的账户:', accounts[0]);
        // 自动连接
        await connectWallet();
      }
    } catch (error) {
      console.log('检查现有连接时出错:', error);
    }
  }
}

// 检查MetaMask是否安装
function checkMetaMaskInstallation() {
  console.log('检查MetaMask安装状态...');
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask已安装');
    provider = new ethers.BrowserProvider(window.ethereum);
    showStatus('walletStatus', 'info', '请连接您的MetaMask钱包');
  } else {
    console.log('MetaMask未安装');
    showStatus('walletStatus', 'error', '请安装 MetaMask 钱包! 访问: https://metamask.io');
    $('#connectWallet').prop('disabled', true);
  }
}

// 设置事件监听器
function setupEventListeners() {
  $('#connectWallet').click(connectWallet);
  $('#debugBtn').click(toggleDebugInfo);
  $('#sendMessage').click(sendMessage);
  $('#testContract').click(testContract);
  $('#checkDeployment').click(checkContractDeployment);
  $('#getLatestMessage').click(getLatestMessage);
  $('#getMessageByIndex').click(getMessageByIndex);
  $('#refreshStats').click(refreshStats);
  $('#loadAllMessages').click(loadAllMessages);

  // 监听账户变化
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  }
}

// 测试合约连接
async function testContract() {
  if (!contract) {
    showStatus('sendStatus', 'error', '请先连接钱包');
    return;
  }

  try {
    showStatus('sendStatus', 'info', '正在测试合约连接...');

    // 首先检查合约地址是否有代码
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log('合约代码长度:', code.length);

    if (code === '0x' || code.length <= 2) {
      showStatus(
        'sendStatus',
        'error',
        `合约地址 ${CONTRACT_ADDRESS} 上没有部署代码！<br>
                        请检查：<br>
                        1. 合约地址是否正确<br>
                        2. 是否连接到正确的网络<br>
                        3. 合约是否已正确部署`
      );
      return;
    }

    console.log('合约代码存在，长度:', code.length);

    // 测试基本的view函数
    console.log('测试 getTotalMessages...');
    const totalMessages = await contract.getTotalMessages();
    console.log('总消息数:', totalMessages.toString());

    console.log('测试 getContractBalance...');
    const contractBalance = await contract.getContractBalance();
    console.log('合约余额:', ethers.formatEther(contractBalance));

    showStatus(
      'sendStatus',
      'success',
      `合约连接成功！<br>
                    合约代码长度: ${code.length} bytes<br>
                    总消息数: ${totalMessages.toString()}<br>
                    合约余额: ${ethers.formatEther(contractBalance)} ETH`
    );
  } catch (error) {
    console.error('合约测试失败:', error);

    let errorMessage = '合约测试失败: ';

    if (error.code === 'BAD_DATA') {
      errorMessage += '数据解码失败，可能原因：<br>1. 合约ABI不匹配<br>2. 函数名称错误<br>3. 合约版本不一致';
    } else if (error.code === 'CALL_EXCEPTION') {
      errorMessage += '合约调用异常，可能是函数不存在或参数错误';
    } else {
      errorMessage += error.message;
    }

    showStatus('sendStatus', 'error', errorMessage);
  }
}

// 新增：检查合约部署状态
async function checkContractDeployment() {
  if (!provider) {
    showStatus('sendStatus', 'error', '请先连接钱包');
    return;
  }

  try {
    showStatus('sendStatus', 'info', '正在检查合约部署状态...');

    const code = await provider.getCode(CONTRACT_ADDRESS);
    const network = await provider.getNetwork();

    let status = `
                    <strong>网络信息:</strong><br>
                    - 名称: ${network.name}<br>
                    - Chain ID: ${network.chainId}<br>
                    - 合约地址: ${CONTRACT_ADDRESS}<br>
                    - 合约代码: ${code === '0x' ? '❌ 未部署' : '✅ 已部署 (' + code.length + ' bytes)'}<br>
                `;

    if (code === '0x') {
      status += `<br><strong>❌ 合约未部署到当前网络！</strong><br>
                    请检查：<br>
                    1. 合约地址是否正确<br>
                    2. 是否连接到正确的网络<br>
                    3. 合约是否已在当前网络部署`;
      showStatus('sendStatus', 'error', status);
    } else {
      status += `<br><strong>✅ 合约已正确部署</strong>`;
      showStatus('sendStatus', 'success', status);
    }
  } catch (error) {
    console.error('检查合约部署失败:', error);
    showStatus('sendStatus', 'error', '检查失败: ' + error.message);
  }
}

// 切换调试信息显示
async function toggleDebugInfo() {
  const debugDiv = $('#debugInfo');
  debugDiv.toggleClass('hidden');

  if (!debugDiv.hasClass('hidden')) {
    await updateDebugInfo();
  }
}

// 更新调试信息
async function updateDebugInfo() {
  const debugLog = $('#debugLog');
  let info = `
                <strong>时间:</strong> ${new Date().toLocaleString()}<br>
                <strong>ABI状态:</strong> ${CONTRACT_ABI ? '已加载' : '未加载'}<br>
                <strong>MetaMask状态:</strong> ${typeof window.ethereum !== 'undefined' ? '已安装' : '未安装'}<br>
                <strong>Provider:</strong> ${provider ? '已初始化' : '未初始化'}<br>
                <strong>Signer:</strong> ${signer ? '已获取' : '未获取'}<br>
                <strong>Contract:</strong> ${contract ? '已连接' : '未连接'}<br>
                <strong>用户账户:</strong> ${userAccount || '未连接'}<br>
                <strong>合约地址:</strong> ${CONTRACT_ADDRESS}<br>
            `;

  if (window.ethereum) {
    info += `<strong>Ethereum对象:</strong> 存在<br>`;
    info += `<strong>是否为MetaMask:</strong> ${window.ethereum.isMetaMask ? '是' : '否'}<br>`;
  }

  if (provider) {
    try {
      const network = await provider.getNetwork();
      info += `<strong>当前网络:</strong> ${network.name} (Chain ID: ${network.chainId})<br>`;

      // 检查合约代码
      const code = await provider.getCode(CONTRACT_ADDRESS);
      info += `<strong>合约代码:</strong> ${code === '0x' ? '❌ 未部署' : '✅ 已部署 (' + code.length + ' bytes)'}<br>`;
    } catch (e) {
      info += `<strong>网络获取失败:</strong> ${e.message}<br>`;
    }
  }

  if (contract && provider) {
    try {
      // 检查合约代码是否存在
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code !== '0x') {
        // 测试合约连接
        const totalMessages = await contract.getTotalMessages();
        info += `<strong>合约测试:</strong> ✅ 成功 (总消息数: ${totalMessages.toString()})<br>`;
      } else {
        info += `<strong>合约测试:</strong> ❌ 合约未部署<br>`;
      }
    } catch (e) {
      info += `<strong>合约测试失败:</strong> ${e.message}<br>`;
    }
  }

  if (CONTRACT_ABI) {
    info += `<strong>ABI函数数量:</strong> ${CONTRACT_ABI.filter((item) => item.type === 'function').length}<br>`;
  }

  debugLog.html(info);
}

// 连接钱包
async function connectWallet() {
  try {
    console.log('开始连接钱包...');
    showStatus('walletStatus', 'info', '正在连接钱包...');

    // 检查ABI是否已加载
    if (!CONTRACT_ABI) {
      showStatus('walletStatus', 'error', '合约ABI未加载，请刷新页面重试');
      return;
    }

    // 检查MetaMask是否可用
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask未安装');
    }

    // 请求连接账户
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    console.log('获取到的账户:', accounts);

    if (accounts.length === 0) {
      throw new Error('未获取到账户');
    }

    userAccount = accounts[0];
    console.log('当前用户账户:', userAccount);

    // 重新初始化provider和signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    console.log('合约初始化完成');

    // 获取并显示网络信息
    const network = await provider.getNetwork();
    $('#networkInfo').text(`${network.name} (Chain ID: ${network.chainId})`);

    // 显示账户信息
    $('#currentAccount').text(userAccount);
    const balance = await provider.getBalance(userAccount);
    $('#accountBalance').text(parseFloat(ethers.formatEther(balance)).toFixed(4));

    // 更新UI
    $('#accountInfo').removeClass('hidden');
    $('#connectWallet').text('已连接').prop('disabled', true).addClass('connected');
    showStatus('walletStatus', 'success', '钱包连接成功!');

    console.log('UI更新完成');

    // 刷新统计信息
    await refreshStats();
  } catch (error) {
    console.error('连接钱包失败:', error);
    showStatus('walletStatus', 'error', '连接钱包失败: ' + error.message);

    // 重置UI状态
    $('#accountInfo').addClass('hidden');
    $('#connectWallet').text('连接 MetaMask').prop('disabled', false);
  }
}

// 发送消息
async function sendMessage() {
  if (!contract) {
    showStatus('sendStatus', 'error', '请先连接钱包');
    return;
  }

  const message = $('#messageInput').val().trim();
  if (!message) {
    showStatus('sendStatus', 'error', '请输入消息内容');
    return;
  }

  try {
    showStatus('sendStatus', 'info', '正在发送消息...');
    console.log('准备发送消息:', message);

    const ethAmount = $('#ethAmount').val() || '0';
    console.log('转账金额:', ethAmount, 'ETH');

    // 估算gas费用
    let gasEstimate;
    try {
      if (parseFloat(ethAmount) > 0) {
        gasEstimate = await contract.sayHi.estimateGas(message, {
          value: ethers.parseEther(ethAmount),
        });
      } else {
        gasEstimate = await contract.sayHi.estimateGas(message);
      }
      console.log('估算gas费用:', gasEstimate.toString());
    } catch (gasError) {
      console.error('Gas估算失败:', gasError);
      showStatus('sendStatus', 'error', 'Gas估算失败，请检查网络连接和合约地址');
      return;
    }

    // 准备交易选项
    const options = {
      gasLimit: (gasEstimate * 120n) / 100n, // 增加20%的gas限制
    };

    if (parseFloat(ethAmount) > 0) {
      options.value = ethers.parseEther(ethAmount);
    }

    console.log('交易选项:', options);

    // 发送交易
    const tx = await contract.sayHi(message, options);
    console.log('交易已提交:', tx.hash);
    showStatus('sendStatus', 'info', `交易已提交，正在等待确认...<br>交易哈希: ${tx.hash}`);

    // 等待交易确认
    const receipt = await tx.wait();
    console.log('交易已确认:', receipt);

    if (receipt.status === 1) {
      showStatus('sendStatus', 'success', `消息发送成功！<br>交易哈希: ${tx.hash}<br>Gas使用: ${receipt.gasUsed.toString()}`);

      // 清空输入框
      $('#messageInput').val('');
      $('#ethAmount').val('');

      // 刷新统计信息
      await refreshStats();
    } else {
      showStatus('sendStatus', 'error', '交易失败');
    }
  } catch (error) {
    console.error('发送消息失败:', error);

    let errorMessage = '发送失败: ';
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage += '余额不足';
    } else if (error.code === 'USER_REJECTED') {
      errorMessage += '用户取消了交易';
    } else if (error.message.includes('execution reverted')) {
      errorMessage += '合约执行失败，请检查输入参数';
    } else {
      errorMessage += error.message;
    }

    showStatus('sendStatus', 'error', errorMessage);
  }
}

// 获取最新消息
async function getLatestMessage() {
  if (!contract) {
    showStatus('queryStatus', 'error', '请先连接钱包');
    return;
  }

  try {
    showStatus('queryStatus', 'info', '正在查询最新消息...');

    const result = await contract.getLatestMessage();
    displayMessage(result, '最新消息');
    showStatus('queryStatus', 'success', '查询成功!');
  } catch (error) {
    console.error('查询失败:', error);
    showStatus('queryStatus', 'error', '查询失败: ' + error.message);
  }
}

// 按索引获取消息
async function getMessageByIndex() {
  if (!contract) {
    showStatus('queryStatus', 'error', '请先连接钱包');
    return;
  }

  const index = $('#messageIndex').val();
  if (index === '') {
    showStatus('queryStatus', 'error', '请输入消息索引');
    return;
  }

  try {
    showStatus('queryStatus', 'info', '正在查询消息...');

    const result = await contract.getMessage(index);
    displayMessage(result, `消息 #${index}`);
    showStatus('queryStatus', 'success', '查询成功!');
  } catch (error) {
    console.error('查询失败:', error);
    showStatus('queryStatus', 'error', '查询失败: ' + error.message);
  }
}

// 刷新统计信息
async function refreshStats() {
  if (!contract) return;

  try {
    const totalMessages = await contract.getTotalMessages();
    $('#totalMessages').text(totalMessages.toString());

    const contractBalance = await contract.getContractBalance();
    $('#contractBalance').text(ethers.formatEther(contractBalance));

    if (userAccount) {
      const myMessages = await contract.getSenderMessageCount(userAccount);
      $('#myMessages').text(myMessages.toString());
    }
  } catch (error) {
    console.error('刷新统计失败:', error);
  }
}

// 加载所有消息
async function loadAllMessages() {
  if (!contract) {
    alert('请先连接钱包');
    return;
  }

  try {
    const totalMessages = await contract.getTotalMessages();
    console.log('总消息数:', totalMessages.toString());
    const total = parseInt(totalMessages.toString());

    if (total === 0) {
      $('#messagesList').html('<p>暂无消息</p>');
      return;
    }

    $('#messagesList').html('<p>正在加载消息...</p>');
    let messagesHtml = '';

    // 倒序显示消息（最新的在前面）
    for (let i = total - 1; i >= 0; i--) {
      try {
        const result = await contract.getMessage(i);
        messagesHtml += formatMessageHtml(result, i);
      } catch (error) {
        console.error(`获取消息 ${i} 失败:`, error);
      }
    }

    $('#messagesList').html(messagesHtml || '<p>加载消息失败</p>');
  } catch (error) {
    console.error('加载消息失败:', error);
    $('#messagesList').html('<p>加载消息失败: ' + error.message + '</p>');
  }
}

// 显示单个消息
function displayMessage(result, title) {
  const messageHtml = `
                <div class="message-item">
                    <div class="message-header">${title}</div>
                    <div class="message-content">"${result[1]}"</div>
                    <div class="message-meta">
                        发送者: ${result[0]}<br>
                        转账金额: ${ethers.formatEther(result[3])} ETH<br>
                        时间: ${new Date(Number(result[2]) * 1000).toLocaleString()}
                    </div>
                </div>
            `;
  $('#queryStatus').after(messageHtml);
}

// 格式化消息HTML
function formatMessageHtml(result, index) {
  return `
                <div class="message-item">
                    <div class="message-header">消息 #${index}</div>
                    <div class="message-content">"${result[1]}"</div>
                    <div class="message-meta">
                        发送者: ${result[0]}<br>
                        转账金额: ${ethers.formatEther(result[3])} ETH<br>
                        时间: ${new Date(Number(result[2]) * 1000).toLocaleString()}
                    </div>
                </div>
            `;
}

// 显示状态信息
function showStatus(elementId, type, message) {
  $(`#${elementId}`).removeClass('success error info').addClass(type).text(message);
}

// 处理账户变化
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // 用户断开了连接
    location.reload();
  } else if (accounts[0] !== userAccount) {
    // 用户切换了账户
    location.reload();
  }
}

// 处理网络变化
function handleChainChanged() {
  location.reload();
}
