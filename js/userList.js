var Web3 = require ('web3');
var Accounts = require('web3-eth-accounts');
var fs = require('fs');
var pv = require ("./privateVariables.js");

module.exports = User;

function User (user) {
    this.name = user.name;
    this.addr = user.addr;
    this.balance = user.balance;
}

var web3 = new Web3();
var accountFileParent = "./keyStore"
var accountFile = "./keyStore/keystore.json";
var deployedContractFile = "./output/deployedContract.json"
var compiledContractFile = "./output/compiledContract.json"


User.prototype.connect = function () {
    return web3.setProvider(new Web3.providers.HttpProvider("https://rinkeby.infura.io/hx12t4pzftmN18k7tvGf"));
}

User.prototype.getBlockNumber = function() {
     return web3.eth.getBlockNumber();
}

User.prototype.hasAccount = function () {
   return fs.existsSync(accountFile);
}

User.prototype.createAccount = function (password) {
    var keyStore = web3.eth.accounts.wallet.create(1).encrypt(password);

    mkdirSync(accountFileParent);
    fs.writeFileSync(accountFile,
        JSON.stringify(keyStore,null,4),
        function(err){
            return err;
        });
}

User.prototype.getAccount = function(password) {
    var keyStore = fs.readFileSync(accountFile,
        function(err){
            if(!err) return console.log("Read successs!!");
            console.log("failed to read " + err);
        });

    keyStore = JSON.parse(keyStore);

    return web3.eth.accounts.wallet.decrypt(keyStore,password);
}

User.prototype.getEtherBalance = function (account) {

    return web3.eth.getBalance(account.address)
}

User.prototype.convertWei = function(balance, unit){
    return web3.utils.fromWei(balance,unit)
}

User.prototype.deployContract = function (address){
    if (!user.isContractDeployed()){
        var compiledContract = fs.readFileSync(compiledContractFile);
        var contract = JSON.parse(compiledContract);
        var abi = contract.contracts['RestrictedUserListTransaction.sol:RestrictedUserListTransaction']['abi'];
        var code = contract.contracts['RestrictedUserListTransaction.sol:RestrictedUserListTransaction']['bin'];
        var myContract = new web3.eth.Contract(JSON.parse(abi));

        myContract.deploy({data:'0x'+code, arguments: []}).send({from:address,gas:6000000, gasPrice: '50000000000'})
        .then((ret) => {
            fs.writeFileSync(deployedContractFile,
            JSON.stringify(ret,null,4),
            function(err){
                return err;
            });})
        .catch((ret) => {
                console.log("can not deploy the contract" + ret)
            });
      }
}

User.prototype.isContractDeployed = function (){
    return fs.existsSync(deployedContractFile);
}

User.prototype.getContract = function () {
    var deployedContract = fs.readFileSync(deployedContractFile);

    var compiledContract = fs.readFileSync(compiledContractFile);
    var abi = JSON.parse(compiledContract).contracts['RestrictedUserListTransaction.sol:RestrictedUserListTransaction']['abi'];

    var MyContract = new web3.eth.Contract(JSON.parse(abi))
    MyContract.options.address =JSON.parse(deployedContract).options.address;
    MyContract.options.from = this.getAccount(pv.accountPass)[0].address;
    MyContract.options.gasPrice = '20000000000';
    MyContract.options.gas = 1100000;
    return MyContract;
}

User.prototype.balanceOf = function(addr){
    var contract = this.getContract();
    return contract.methods.balanceOf(addr).call();
}

User.prototype.getTotalBalance = function () {
  return this.getContract().methods.getTotalBalance().call();
}

User.prototype.getSymbol = function () {
  return this.getContract().methods.getSymbol().call();
}

User.prototype.getTokenName = function () {
  return this.getContract().methods.getTokenName().call();
}

User.prototype.getDecimals = function () {
  return this.getContract().methods.getDecimals().call();
}

User.prototype.getUserNumber = function (address) {
  return this.getContract().methods.getUserNumber(address).call();
}

User.prototype.getOwnerNumber = function () {
  return this.getContract().methods.getOwnerNumber().call();
}

User.prototype.isUserExists = function(addr){
  return this.getContract().methods.isUserExists(addr).call();
}

User.prototype.mintToken = function(balance){
    return this.getContract().methods.mint(balance).send({from:this.getAccount(pv.accountPass)[0].address ,gas:1000000, gasPrice: '20000000000'});
}

User.prototype.transfer = function(to,balance){
    return this.getContract().methods.transfer(to, balance).send({from:this.getAccount(pv.accountPass)[0].address ,gas:1000000, gasPrice: '20000000000'});
}

User.prototype.transferOwnership = function (address){
  console.log("Transfer Ownership to " + address);
    return this.getContract().methods.transferOwnership(address).send({from:this.getAccount(pv.accountPass)[0].address ,gas:1000000, gasPrice: '20000000000'});
}

User.prototype.approve = function (address, balance){
  console.log("approve that " + address + " can spent " + balance +" tokens");
    return this.getContract().methods.approve(address, balance).send({from:this.getAccount(pv.accountPass)[0].address ,gas:1000000, gasPrice: '20000000000'});
}

User.prototype.allowance = function(ownerAddress, spenderAddress){
    return this.getContract().methods.allowance(ownerAddress, spenderAddress).call();
}

User.prototype.addUser = async function(address, amount){
    var contract = this.getContract();
    return web3.eth.sendTransaction({
        from:this.getAccount(pv.accountPass)[0].address,
        to:contract.options.address,
        gas:1000000,
        gasPrice:'20000000000',
        data:contract.methods.addUser(address, amount).encodeABI()
    });
}

User.prototype.transferFrom = function(from, to, amount) {
    return this.getContract().methods.transferFrom(from, to, amount).send({from:this.getAccount(pv.accountPass)[0].address ,gas:1000000, gasPrice: '20000000000'});
}

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}
