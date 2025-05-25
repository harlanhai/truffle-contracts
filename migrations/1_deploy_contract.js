const SayHi = artifacts.require('SayHi');

module.exports = function (deployer) {
  deployer.deploy(SayHi);
};