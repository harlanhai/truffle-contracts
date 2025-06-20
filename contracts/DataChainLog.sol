// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract DataChainLog {
    // 数据存储
    event DataLog(address indexed sender, string dataLog, uint256 timestamp);

    // 存储数据函数
    function setData(string memory _content) public {
        require(bytes(_content).length > 0, "Content cannot be empty");
        emit DataLog(msg.sender, _content, block.timestamp);
    }
}
