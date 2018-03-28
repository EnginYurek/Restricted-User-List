var User = require ("./js/userList.js");
var pv = require ("./js/privateVariables.js");

var user = new User({name:"engin"});
user.connect();

user.getBlockNumber().then((blockNumber) => {
    console.log(blockNumber);
    document.getElementById("block_number").innerHTML = "Current Block Number:"+blockNumber;
}).catch((err) => (console.log(err)));

var account;
if (!user.hasAccount()){
    user.createAccount(pv.accountPass);
    console.log("account created");
}

account = user.getAccount(pv.accountPass);
console.log(" account address is  " + JSON.stringify(account[0].address));
setTimeout(function(){
  document.getElementById("eth_address").innerHTML = "Rinkeby ETH Address\n"+JSON.stringify(account[0].address);
},10);

user.getEtherBalance(account[0]).then(function(balance){
    console.log("get ether balance successfully " + user.convertWei(balance,'ether'));
    document.getElementById("eth_balance").innerHTML = "Balance: "+user.convertWei(balance,'ether') + " ETH";
}).catch(function(ret){
    console.log("can not get balance: "+ ret)
});

/*if (!user.isContractDeployed())
{
  user.deployContract(account[0].address)
  console.log("contract deployed");
}*/


setTimeout(function(){
  if (!user.isContractDeployed()){
      var deploy_btn = document.createElement("button");
      deploy_btn.innerHTML = "Deploy";
      document.getElementById("deployButton").appendChild(deploy_btn);
      deploy_btn.addEventListener("click",function(){
        user.deployContract(account[0].address)
        console.log("contract deployed");
      });
  } else {
    {
      console.log("contract is AlreadY Deployed !!!")
    }
  }
},20);

setTimeout(function(){
  user.balanceOf(account[0].address)
  .then((ret)=>{
    document.getElementById("token_balance").innerHTML = "Token Balance: "+ret;
  })
  .catch((ret)=>{
    console.log(ret);
  });
},20);


var contract = user.getContract();
setTimeout(function(){
  console.log(contract.options.address);
  document.getElementById("contract_address").innerHTML = "Contract Address "+JSON.stringify(contract.options.address);
},20);

function isUserExists(){
  var user_address = document.getElementById("is_user_exist").value;
  user.isUserExists(user_address)
  .then((isExists) => {
    console.log(user_address + " is " + isExists)
  })
  .catch((isExists)=>{
    console.log("Sorry " + isExists)
  })
}

//0x60943a9AAb181bC4A68CE3CB30bdC011454bCF3C
function addUserBtnHandler(){
  var address = document.getElementById("add_user").value;
  user.isUserExists(address).then(isExists =>{
    if (!isExists){
      user.addUser(address,1000);
      console.log("User added");
    }else{
      console.log("User exists");
    }
  });
};
