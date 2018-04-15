const RULT = artifacts.require("RestrictedUserListTransaction");

contract('Get methods of contract initially', async (accounts) => {

  let contract;
  let testAddress = accounts[5];
  before(async () => {
      let instance = await RULT.deployed();
      contract = instance["contract"]
    });

  it("Should return token name correctly", async () => {
     let tokenName = await contract.getTokenName.call();
     assert.isString(tokenName, "Not a string");
     assert.equal(tokenName, "Restricted UserList Transaction", "Token name is wrong");
  });

  it ("Should return total balance", async () => {
    let totalBalance = await contract.getTotalBalance.call();
    assert.isNumber(totalBalance['c'][0], "Not a number");
    assert.equal(totalBalance, 100000000, "Initial balance is wrong");
  });

  it ("Should return token symbol", async () => {
    let symbol = await contract.getSymbol.call();
    assert.isString(symbol, "Not a strnig");
    assert.equal(symbol, "RULT", "Wrong symbol");
  });

  it ("Sholud return decimals", async () => {
    let decimals = await contract.getDecimals.call();
    assert.isNumber(decimals['c'][0], "Not a number");
    assert.equal(decimals, 18);
  });

  it ("Should return zero as user number", async () => {
    let userNumber = await contract.getUserNumber.call(testAddress);
    assert.isNumber(userNumber['c'][0], "Not a number");
    assert.equal(userNumber, 0, "Non user accounts must not have user number");
  });

  it ("Should return user doesnt exists", async () => {
    let isUser = await contract.isUserExists.call(testAddress);
    assert.isBoolean(isUser, "Not a boolean");
    assert.isFalse(isUser, "User in in the list");
  });

  it ("Should return true. Owner is the first user by default", async () => {
    let isUser = await contract.isUserExists.call(accounts[0]);
    assert.isBoolean(isUser, "Not a boolean");
    assert.isTrue(isUser, "User in in the list");
  });

  it ("Should return balance of an external account as zero", async () => {
    let balanceOf = await contract.balanceOf.call(testAddress);
    assert.isNumber(balanceOf['c'][0], "Not a number");
    assert.equal(balanceOf, 0, "Balance is wrong")
  });

  it ("Should return balance of owner as total balance", async () => {
    let balanceOf = await contract.balanceOf.call(accounts[0]);
    let totalBalance = await contract.getTotalBalance.call();
    assert.isNumber(balanceOf['c'][0], "Not a number");
    assert.equal(balanceOf['c'][0], totalBalance['c'][0], "Balance is wrong")
  });

  it ("Should return owner number as 1", async () => {
    let ownerNuber = await contract.getOwnerNumber.call();
    assert.isNumber(ownerNuber['c'][0], "Not a number");
    assert.equal(ownerNuber, 1, "Owner number is wrong");
  });

  it ("Sould return allowed amount of token to spend with registered user", async () => {
    let allowance = await contract.allowance.call(accounts[0], testAddress);
    assert.isNumber(allowance['c'][0], "Not a number");
    assert.equal(allowance['c'][0], 0, "Allowance is zero initially");
  });

  it ("Sould return allowed amount of token to spend with unregistered user", async () => {
    let allowance = await contract.allowance.call(testAddress, accounts[0]);
    assert.isNumber(allowance['c'][0], "Not a number");
    assert.equal(allowance['c'][0], 0, "Allowance is zero initially");
  });
});

contract('Add User', async (accounts) => {

//! TODO: Error cases is not handled yet. eg. Adding same user twice

  let contract;
  let isExists;
  let userAddress = accounts[1];
  let userBalance = 10000;

  let userAddress2 = accounts[2];
  let userBalance2 = 5000;

  before(async () => {
      let instance = await RULT.deployed();
      contract = instance["contract"]

      isExists = await contract.isUserExists.call(userAddress);

      await  contract.addUser(userAddress, userBalance, {from: accounts[0],gas:1000000, gasPrice: '20000000000'});
    });

  it ("User does not exits initially", async () => {
    assert.isFalse(isExists, "User is alreadyy added. Err...");
  });

  it ("User exits after addUser operation", async () => {
    let isNewUserExists = await contract.isUserExists.call(userAddress);
    assert.isTrue(isNewUserExists, "New user does not exits");
  });

  it ("User number is 2", async () => {
    //user number 1 belongs to owner
    let userNumber = await contract.getUserNumber.call(userAddress);
    assert.equal(userNumber, 2, "User number is wrong");
  });

  it ("Token balance of first user is 1000", async () => {
      let balanceOf = await contract.balanceOf.call(userAddress);
      assert.equal(balanceOf, userBalance, "Balance is wrong");
  });

  it ("Total balance does not changed", async () => {
    let totalBalance = await contract.getTotalBalance.call();
    let balanceOfOwner = await contract.balanceOf.call(accounts[0]);
    let balanceOfUser = await contract.balanceOf.call(userAddress);
    assert.equal(totalBalance['c'][0], balanceOfOwner.toNumber() + balanceOfUser.toNumber(), "Balances mismatch");
  });

  it ("Add second user", async () => {
    await  contract.addUser(userAddress2, userBalance2, {from: accounts[0],gas:1000000, gasPrice: '20000000000'});
    let isNewUserExists = await contract.isUserExists.call(userAddress2);
    assert.isTrue(isNewUserExists, "Second user does not added");
  });

  it ("User number of second user is 3", async () =>  {
    let userNumber = await contract.getUserNumber.call(userAddress2);
    assert.equal(userNumber['c'][0], 3, "User number is wrong");
  });

  it ("Token balance of second user is 5000", async () => {
    let balanceOf = await contract.balanceOf.call(userAddress2);
    assert.equal(balanceOf['c'][0], userBalance2, "Balance is wrong")
  });

  it ("Total balance does not changed", async () => {
    let totalBalance = await contract.getTotalBalance.call();
    let balanceOfOwner = await contract.balanceOf.call(accounts[0]);
    let balanceOfUser1 = await contract.balanceOf.call(userAddress);
    let balanceOfUser2 = await contract.balanceOf.call(userAddress2);
    assert.equal(totalBalance['c'][0], balanceOfOwner.toNumber() + balanceOfUser1.toNumber() + balanceOfUser2.toNumber(), "Balances mismatch");
  });
});

contract('Mint', async (accounts) => {

  let contract;
  let initialTotalBalance;
  let initialOwnerBalance;
  let mintAmount1 = 55000;
  let mintAmount2 = 5;

  before(async () => {
      let instance = await RULT.deployed();
      contract = instance["contract"];

      initialTotalBalance = await contract.getTotalBalance.call();
      initialOwnerBalance = await contract.balanceOf.call(accounts[0]);
    });

  it ("Total balance is equal to owner balance", async () => {
    assert.equal(initialTotalBalance['c'][0], initialOwnerBalance['c'][0], "İnitial balances are mismatch");
  });

  it ("Total balance increases after first minting", async () => {
    await  contract.mint(mintAmount1, {from: accounts[0],gas:1000000, gasPrice: '20000000000'});
    let totalBalance = await contract.getTotalBalance.call();
    assert.equal(totalBalance['c'][0], initialTotalBalance.toNumber() + mintAmount1, "Total balance does not increases after minting");
  });

  it ("Owner balance increases after first minting", async () => {
    let ownerBalance = await contract.balanceOf.call(accounts[0]);
    assert.equal(ownerBalance['c'][0], initialOwnerBalance.toNumber() + mintAmount1, "Owner balance does not increses after minting");
  });

  it ("Total balance increases after second minting", async () => {
    await  contract.mint(mintAmount2, {from: accounts[0],gas:1000000, gasPrice: '20000000000'});
    let totalBalance = await contract.getTotalBalance.call();
    assert.equal(totalBalance['c'][0], initialTotalBalance.toNumber() + mintAmount1 + mintAmount2, "Total balance does not increases after minting");
  });

  it ("Owner balance increases after second minting", async () => {
    let ownerBalance = await contract.balanceOf.call(accounts[0]);
    assert.equal(ownerBalance['c'][0], initialOwnerBalance.toNumber() + mintAmount1 + mintAmount2, "Owner balance does not increses after minting");
  });
});

contract ('Transfer', async(accounts) => {

  let contract;
  let transferAmount01 = 243433;
  let transferAmount12 = 100000;
  let owner = accounts[0];
  let receiver1 = accounts[1]; //is also sender2. sender1 is owner
  let receiver2 = accounts[2];
  let totalBalance;

  before(async () => {
      let instance = await RULT.deployed();
      contract = instance["contract"];

      totalBalance = await contract.getTotalBalance.call();

      await  contract.addUser(receiver1, 0, {from: owner, gas:1000000, gasPrice: '20000000000'});
      await  contract.addUser(receiver2, 0, {from: owner, gas:1000000, gasPrice: '20000000000'});
    });

  it ("Check initial states", async () => {
    let receiverBalance1 = await contract.balanceOf.call(receiver1);
    let receiverBalance2 = await contract.balanceOf.call(receiver2);
    let ownerBalance = await contract.balanceOf.call(owner);

    assert.equal(receiverBalance1['c'][0], 0, "Receiver 1 initially does not have 0 token");
    assert.equal(receiverBalance2['c'][0], 0, "Receiver 2 initially does not have 0 token");
    assert.equal(ownerBalance['c'][0], totalBalance['c'][0], "Owner balance has changed");
  });

  it ("Transfer the first amount", async () => {
    await  contract.transfer(receiver1, transferAmount01, {from: owner ,gas:1000000, gasPrice: '20000000000'});
    let ownerBalance = await contract.balanceOf.call(owner);

    assert.equal(totalBalance['c'][0], ownerBalance['c'][0] + transferAmount01 , "Balances mismatch");
  });

  it ("First receiver balance is equal to first transfer amount", async () => {
    let receiverBalance1 = await contract.balanceOf.call(receiver1);

    assert.equal(receiverBalance1['c'][0], transferAmount01, "Transfer amount mismatch");
  });

  it ("Transfer the second amount", async () => {
    await  contract.transfer(receiver2, transferAmount12, {from: receiver1 ,gas:1000000, gasPrice: '20000000000'});
    let receiverBalance1 = await contract.balanceOf.call(receiver1);

    assert.equal(receiverBalance1['c'][0], transferAmount01 - transferAmount12 , "Balances mismatch");
  });

  it ("Second receiver balance is equal to second transfer amount", async () => {
    let receiverBalance2 = await contract.balanceOf.call(receiver2);

    assert.equal(receiverBalance2['c'][0], transferAmount12, "Transfer amount mismatch");
  });

  it ("Remaining token amount of receiver1 after second transfer", async () => {
    let receiverBalance1 = await contract.balanceOf.call(receiver1);
    let receiverBalance2 = await contract.balanceOf.call(receiver2);

    assert.equal(receiverBalance1['c'][0], transferAmount01 - receiverBalance2['c'][0], "Transfer amount mismatch");
  });

  it ("Total circulating amount of token should does not change", async () =>{
    let receiverBalance1 = await contract.balanceOf.call(receiver1);
    let receiverBalance2 = await contract.balanceOf.call(receiver2);
    let ownerBalance = await contract.balanceOf.call(owner);

    assert.equal(totalBalance['c'][0], receiverBalance1['c'][0] + receiverBalance2['c'][0] + ownerBalance['c'][0], "Total number of tokens are changed");
  });

});


contract ('approve', async(accounts) => {
  let contract;
  let approveBalance1 = 1000;
  let allowedAccount1 = accounts[1];

  let approveBalance2 = 2000;
  let allowedAccount2 = accounts[2];

  //account 1 will approve account 2
  let approveBalance3 = 5500;
  let allowedAccount3 = accounts[2];

  let allowance1;
  let allowance2;
  let allowance3;

  let balanceOfAllower1;
  let balanceOfAllower2;
  let balanceOfSpeder1;
  let balanceOfSpeder2;
  let balanceOfSpeder3;

  before(async () => {
      let instance = await RULT.deployed();
      contract = instance["contract"];

      balanceOfAllower1 = await contract.balanceOf.call(accounts[0]);
      balanceOfAllower2 = await contract.balanceOf.call(accounts[1]);
      balanceOfSpeder1 = await contract.balanceOf.call(accounts[1]);
      balanceOfSpeder2 = await contract.balanceOf.call(accounts[2]);
      balanceOfSpeder3 = await contract.balanceOf.call(accounts[3]);

      allowance1 = await contract.allowance.call(accounts[0], accounts[1]);
      allowance2 = await contract.allowance.call(accounts[0], accounts[2]);
      allowance3 = await contract.allowance.call(accounts[1], accounts[2]);
    });

    it ("İnitial allowances are zero", async () => {
        assert.equal(allowance1['c'][0], 0, "Initial allowance does not zero");
        assert.equal(allowance2['c'][0], 0, "Initial allowance does not zero");
        assert.equal(allowance3['c'][0], 0, "Initial allowance does not zero");
    });

    it ("Approve of first address is successfull", async () => {
        await  contract.approve(accounts[1], approveBalance1, {from: accounts[0] ,gas:1000000, gasPrice: '20000000000'});
        let allowance = await contract.allowance.call(accounts[0], accounts[1]);

        let balanceOfAllower = await contract.balanceOf.call(accounts[0]);
        let spenderBalance1 = await contract.balanceOf.call(accounts[1]);

        assert.equal(allowance['c'][0], approveBalance1, "Approve of first address is wrong");
        assert.equal(balanceOfAllower['c'][0], balanceOfAllower1, "Balance of allower should not change");
        assert.equal(spenderBalance1['c'][0], balanceOfSpeder1, "Balance of spender1 should not change");

    });

    it ("Approve of second address is successfull", async () => {
        await  contract.approve(accounts[2], approveBalance2, {from: accounts[0] ,gas:1000000, gasPrice: '20000000000'});
        let allowance = await contract.allowance.call(accounts[0], accounts[2]);

        let balanceOfAllower = await contract.balanceOf.call(accounts[0]);
        let spenderBalance2 = await contract.balanceOf.call(accounts[2]);

        assert.equal(allowance['c'][0], approveBalance2, "Approve of second address is wrong");
        assert.equal(balanceOfAllower['c'][0], balanceOfAllower1, "Balance of allower should not change");
        assert.equal(spenderBalance2['c'][0], balanceOfSpeder2, "Balance of spender2 should not change");
    });

    it ("Approve firs address to second address", async () => {
        await  contract.approve(accounts[2], approveBalance3, {from: accounts[1] ,gas:1000000, gasPrice: '20000000000'});
        let allowance = await contract.allowance.call(accounts[1], accounts[2]);

        let balanceOfAllower = await contract.balanceOf.call(accounts[1]);
        let spenderBalance3 = await contract.balanceOf.call(accounts[2]);

        assert.equal(allowance['c'][0], approveBalance3, "Approve of first address is wrong");
        assert.equal(balanceOfAllower['c'][0], balanceOfAllower, "Balance of allower should not change");
        assert.equal(spenderBalance3['c'][0], balanceOfSpeder3, "Balance of spender2 should not change");
    });
});


contract ('transferOwnership', async(accounts) => {

  let contract;
  let previousOwnerBalance;

  let newOwnerNumber;
  let newOwnerAddress = accounts[7];
  let newOwnerBalance = 7777;

  let testUserAddress = accounts[3];
  let testUserBalance = 55;

  before(async () => {
      let instance = await RULT.deployed();
      contract = instance["contract"];

      previousOwnerBalance = await contract.balanceOf.call(accounts[1]);

      await  contract.addUser(newOwnerAddress, newOwnerBalance, {from: accounts[0],gas:1000000, gasPrice: '20000000000'});
      newOwnerNumber =  await contract.getUserNumber.call(newOwnerAddress);

      await  contract.transferOwnership(newOwnerAddress, {from: accounts[0],gas:1000000, gasPrice: '20000000000'});

    });

    it ("Owner number is updated", async () => {
      let ownerNumber = await contract.getOwnerNumber.call();
      assert.equal(ownerNumber['c'][0], newOwnerNumber['c'][0], "Owner number does not updated");
    });

    it ("Balances are not changed", async () => {
      let previousOwnerBalanceAfterTransfer = await contract.balanceOf.call(accounts[1]);
      let newOwnerBalanceAfterTransfer = await contract.balanceOf.call(newOwnerAddress);

      assert.equal(previousOwnerBalanceAfterTransfer['c'][0], previousOwnerBalance['c'][0], "Previous owner balance has changed");
      assert.equal(newOwnerBalanceAfterTransfer['c'][0], newOwnerBalance, "New owner balance has changed");
    });

    it ("New owner is able to add users", async () =>{
      await  contract.addUser(testUserAddress, testUserBalance, {from:newOwnerAddress ,gas:1000000, gasPrice: '20000000000'});
      let userNumber =  await contract.getUserNumber.call(testUserAddress);

      assert.equal(userNumber['c'][0], 3, "New owner can not add new users");
    });
});
