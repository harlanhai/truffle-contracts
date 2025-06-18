const MyToken = artifacts.require("MyToken");

module.exports = function(deployer) {
  deployer.deploy(
    MyToken,
    "Yi Deng Token",
    "YD",
    1000000
  )
}