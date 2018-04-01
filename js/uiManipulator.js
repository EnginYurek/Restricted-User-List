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

setTimeout(function(){
  user.getTotalBalance()
  .then((ret) => {
    document.getElementById("total_balance").innerHTML = "Total token balance is: " + ret;
    console.log("total balance is " + ret);
  })
  .catch((ret) => {
    console.log("Can not get Total balance. Error: " + ret);
  })
},20);

setTimeout(function(){
  user.getSymbol()
  .then (ret => {
    document.getElementById("token_symbol").innerHTML = "Token symbol is: " + ret;
  })
  .catch(ret => {
    console.log("Token symbol error " + ret);
  })
}, 20);

setTimeout(function(){
  user.getTokenName().then(ret => {document.getElementById("token_name").innerHTML = "Token Name: " + ret}).catch(ret =>{ console.log("Token Name Err: " + ret)})
},20)

setTimeout(function(){
  user.getDecimals().then(ret => {document.getElementById("token_decimals").innerHTML = "Token Decimals: " + ret}).catch(ret =>{ console.log("Token Decimals Err: " + ret)})
},20)

setTimeout(function(){
  user.getOwnerNumber().then(ret => {document.getElementById("owner_number").innerHTML = "Owner Number: " + ret}).catch(ret =>{ console.log("Owner Nmuber Err: " + ret)})
},20)


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

function mintToken(){
  var token_balance = document.getElementById("mint_input").value;
  user.mintToken(token_balance)
  .then(ret =>{
    console.log(ret);
  })
  .catch(ret => {
    console.log("Err token Mint " + ret);
  })
}

function getUserNumber(){
  var user_number = document.getElementById("user_number").value;
  user.getUserNumber(user_number)
  .then(ret =>{
    console.log(ret);
  })
  .catch(ret => {
    console.log("Err token Mint " + ret);
  })
}

function transferTo(){
  var address = document.getElementById("transfer_to").value;
  var amount = document.getElementById("transfer_amount").value;
  user.transfer(address, amount)
  .then(ret => {
    console.log("Transfer Succesfull");
    console.log(ret);
  })
  .catch(ret => {
    console.log("Error transfer: ");
    console.log(ret);
  })
}

function transferOwnership(){
  var address = document.getElementById("transfer_ownership_address").value;
  user.transferOwnership(address)
  .then(ret => {
    console.log("Transfer ownership successfull");
    console.log(ret);
  })
  .catch(ret => {
    console.log("Trasfer ownership failed");
    console.log(ret);
  })
}


function approve(){
  var address = document.getElementById("approve_address").value;
  var amount = document.getElementById("approve_amount").value;
  user.approve(address, amount)
  .then(ret => {
    console.log("Approved " + address + " with " + amount + " from " + account[0])
    console.log(ret);
  })
  .catch(ret => {
    console.log("Approve failed");
    console.log(ret);
  })
}


function allowance(){
  var boss_address = document.getElementById("boss_address").value;
  var spender_address = document.getElementById("spender_address").value;
  user.allowance(boss_address, spender_address)
  .then(ret => {
    console.log(boss_address + " allows " + spender_address + " to spend " + ret);
  })
  .catch(ret => {
    console.log("Allowance error");
  })
  .catch(ret =>{
    console.log(ret);
  })
}

function transferFrom(){
  var transfer_from_addr = document.getElementById("transfer_from_from").value;
  var transfer_to_addr = document.getElementById("transfer_from_to").value;
  var transfer_from_amount = document.getElementById("transfer_from_amount").value;
  user.transferFrom(transfer_from_addr, transfer_to_addr, transfer_from_amount)
  .then(ret => {
    console.log("Transfer From success");
    console.log(ret);
  })
  .catch(ret => {
    console.log("Transfer From error");
    console.log(ret);
  })
}
