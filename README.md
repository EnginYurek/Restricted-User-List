# Restricted-User-List

Add a personal password into privateVariables.js This password will encode your private key.

```
npm init
npm install
```
### Compile the contracts
```
mkdir output
cd contracts
solc RestrictedUserListTransaction.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > ../output/compiledContract.json
cd ..
```

To be able to successfully deploy the contract, get some free ether from https://faucet.rinkeby.io/

### Run
```
electron .
```

### Run Truffle Tests
Install ganache by following http://truffleframework.com/docs/ganache/using

```
npm install -g truffle
truffle test
```
