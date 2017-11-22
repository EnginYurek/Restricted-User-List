var fs = require('fs');
var web3 = require ('web3');
var User = require ("./userList.js");
var pv = require ("./privateVariables.js");

var user = new User({name:"engin"});

if (user.connect()){
    
    user.getBlockNumber().then((blockNumber) => {
        console.log(blockNumber);
    }).catch((err) => (console.log(err)));

    var account;
    if (!user.hasAccount()){
        user.createAccount(pv.accountPass);
        console.log("account created");
    }

    account = user.getAccount(pv.accountPass);
    console.log(" account address is  " + JSON.stringify(account[0].address));

    user.getEtherBalance(account[0]).then(function(balance){
        console.log("get ether balance successfully " + web3.utils.fromWei(balance,'ether'));
    }).catch(function(ret){
        console.log("can not get balance: "+ ret)
    });

    
    if (!user.isContractDeployed()){

        user.deployContract(account[0].address)
    } else{
        user.isUserExists("0xcaa56903094cb3798f78fd92adc83d32adc5cd97")
        .then(isExists => {
            if(!isExists){
                
                user.addUser("0xcaa56903094cb3798f78fd92adc83d32adc5cd97",1000);
            }else{
                user.balanceOf("0xcaa56903094cb3798f78fd92adc83d32adc5cd97").
                then(balance =>{
                    console.log("token balance of 0xcaa56903094cb3798f78fd92adc83d32adc5cd97 is: " + balance);
                    if (balance != "21000"){
                        user.transfer("0xcaa56903094cb3798f78fd92adc83d32adc5cd97",20000).then(ret =>{console.log("transfer: " + ret);}).catch(err =>{console.log("Error: " + err);})
                    }else{
                            user.allowance(user.getAccount(pv.accountPass)[0].address,"0xcaa56903094cb3798f78fd92adc83d32adc5cd97")
                            .then(ret =>{
                                console.log("transfer: " + ret);
                                if (ret == 0){
                                    user.approve("0xcaa56903094cb3798f78fd92adc83d32adc5cd97",5000).then(ret=>{console.log("approval is successfull " + ret);}).catch(err => {console.log("Error: " + err)})
                                }else{
                                    user.transferFrom();
                                    user.balanceOf(user.getAccount(pv.accountPass)[0].address).
                                    then(balance =>{
                                        console.log("balance of main : " + balance);});
                                }
                            })
                        }
                })
                .catch(err =>{
                    console.log("Error: " + err);
                })
            }
            
            });
    }
}

                                                                                                               

