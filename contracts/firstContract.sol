// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract FirstContract {
    // 状态变量
    address public owner;
    uint256 public totalMessages;
    
    // 事件
    event MessageSent(address indexed sender, string message, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    // 存储消息的结构体
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        uint256 amount;
    }
    
    // 存储所有消息
    Message[] public messages;
    
    // 修饰符：只有合约拥有者可以执行
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // 构造函数
    constructor() {
        owner = msg.sender;
        totalMessages = 0;
    }
    
    // Say Hi 函数 - 支持转账
    function sayHi(string memory _message) public payable {
        require(bytes(_message).length > 0, "Message cannot be empty");
        
        // 创建新消息
        Message memory newMessage = Message({
            sender: msg.sender,
            content: _message,
            timestamp: block.timestamp,
            amount: msg.value
        });
        
        // 存储消息
        messages.push(newMessage);
        totalMessages++;
        
        // 触发事件
        emit MessageSent(msg.sender, _message, msg.value);
    }
    
    // 获取指定索引的消息
    function getMessage(uint256 _index) public view returns (
        address sender,
        string memory content,
        uint256 timestamp,
        uint256 amount
    ) {
        require(_index < messages.length, "Message index out of bounds");
        Message memory message = messages[_index];
        return (message.sender, message.content, message.timestamp, message.amount);
    }
    
    // 获取最新消息
    function getLatestMessage() public view returns (
        address sender,
        string memory content,
        uint256 timestamp,
        uint256 amount
    ) {
        require(messages.length > 0, "No messages available");
        return getMessage(messages.length - 1);
    }
    
    // 获取合约余额
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // 提取合约中的资金（只有拥有者可以）
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, balance);
    }
    
    // 获取消息总数
    function getTotalMessages() public view returns (uint256) {
        return totalMessages;
    }
    
    // 获取发送者的消息数量
    function getSenderMessageCount(address _sender) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (messages[i].sender == _sender) {
                count++;
            }
        }
        return count;
    }
}