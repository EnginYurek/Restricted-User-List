const RULT = artifacts.require("RestrictedUserListTransaction");

contract('Get methods of contract initially', async (accounts) => {

  let contract;
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
    let userNumber = await contract.getUserNumber.call("0x6566f8cdcf847b16c0fbbd825f2e3021896f9ac6");
    assert.isNumber(userNumber['c'][0], "Not a number");
    assert.equal(userNumber, 0, "Non user accounts must not have user number");
  });

  it ("Should return user doesnt exists", async () => {
    let isUser = await contract.isUserExists.call("0x6566f8cdcf847b16c0fbbd825f2e3021896f9ac6");
    assert.isBoolean(isUser, "Not a boolean");
    assert.isFalse(isUser, "User in in the list");
  });

  it ("Should return balance of an external account as zero", async () => {
    let balanceOf = await contract.balanceOf.call("0x6566f8cdcf847b16c0fbbd825f2e3021896f9ac6");
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
    let allowance = await contract.allowance.call(accounts[0], "0x6566f8cdcf847b16c0fbbd825f2e3021896f9ac6");
    assert.isNumber(allowance['c'][0], "Not a number");
    assert.equal(allowance['c'][0], 0, "Allowance is zero initially");
  });

  it ("Sould return allowed amount of token to spend with unregistered user", async () => {
    let allowance = await contract.allowance.call("0x6566f8cdcf847b16c0fbbd825f2e3021896f9ac6", accounts[0]);
    assert.isNumber(allowance['c'][0], "Not a number");
    assert.equal(allowance['c'][0], 0, "Allowance is zero initially");
  });
})
