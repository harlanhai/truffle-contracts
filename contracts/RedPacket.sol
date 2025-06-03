// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract RedPacket {
    address sender; // 红包发送者
    uint256 totalAmount; // 红包总金额
    uint256 totalCount; // 红包数量
    uint256 remainCount; // 剩余红包数量
    uint256 remainAmount; // 剩余红包金额
    bool isEqual; // 是否是等额红包
    bool isActive; // 红包是否有效
    mapping(address => bool) claimed; // 使用 mapping 记录已领取用户

    // 创建一个外部函数的红包
    function createRedPacket(uint256 _totalCount, bool _isEqual) external {
        // 校验红包数量
        require(_totalCount > 0, "Total count must be greater than 0");

        // 把红包信息放入红包结构体中
        sender = msg.sender;
        totalCount = _totalCount;
        remainCount = _totalCount;
        isEqual = _isEqual;
        isActive = false;
    }

    // 设置红包总金额
    function deposit() external payable {
        // 判断是否是红包发送者
        require(msg.sender == sender, "Only sender can deposit");
        // 判断红包是否已激活
        require(!isActive, "Red packet is already active");
        // 判断发送的金额是否大于0
        require(msg.value > 0, "Amount must be greater than 0");

        // 设置红包总金额
        totalAmount = msg.value;
        remainAmount = msg.value;
        // 设置红包为激活状态
        isActive = true;
    }

    // 抢红包
    function claimRedPacket() external {
        // 判断红包状态
        require(isActive, "No red packets left");
        // 判断红包发送者不能领取自己的红包
        require(
            msg.sender != sender,
            "Sender cannot claim their own red packet"
        );
        // 判断红包数量是否取完
        require(remainAmount > 0, "No red packets left");
        // 判断是否已领取
        require(!claimed[msg.sender], "Already claimed");

        // 把当前账户状态设置为 true
        claimed[msg.sender] = true;
        remainCount--;
        uint256 claimAmount;

        if (isEqual) {
            // 等额分配
            if (remainAmount == 1) {
                // 最后一个红包，给剩余所有金额
                claimAmount = remainAmount;
            } else {
                claimAmount = totalAmount / totalCount;
            }
        } else {
            // 非等额红包，
            // 计算一个10以内的随机数
            uint256 random = (uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender))
            ) % 6) + 1;
            claimAmount = (totalAmount * random) / 10;

            // 判断 claimAmount 是否大于剩余金额
            if (claimAmount > remainAmount) {
                claimAmount = remainAmount;
            }
        }

        // 更新剩余金额
        remainAmount -= claimAmount;

        // 如果红包数量为0，设置红包为无效状态
        if (remainCount == 0) {
            isActive = false;
        }

        // 转账给领取人
        payable(msg.sender).transfer(claimAmount);
    }

    // 红包发送者收回剩余金额
    function withdrawRemaining() external {
        // 判断是否是红包发送者
        require(msg.sender == sender, "Only sender can withdraw");
        // 判断红包是否已激活
        require(!isActive, "Red packet is still active");
        // 判断剩余金额是否大于0
        require(remainAmount > 0, "No remaining amount to withdraw");

        // 转账剩余金额给发送者
        payable(sender).transfer(remainAmount);
        // 清空剩余金额
        remainAmount = 0; 
        // 设置红包为无效状态
        isActive = false;
    }

    // 查询合约余额
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
        
    // 查询用户是否已领取红包
    function hasClaimed(address _user) external view returns (bool) {
        return claimed[_user];
    }
}