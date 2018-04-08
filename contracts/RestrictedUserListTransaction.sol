pragma solidity ^0.4.17;

import './zeppelin-solidity/contracts/math/SafeMath.sol';
import './zeppelin-solidity/contracts/token/ERC20.sol';

contract RestrictedUserListTransaction is ERC20 {
    //use safeMath library to overcome overflows
    using SafeMath for uint256;


    string public constant SYMBOL = "RULT";
    string public constant NAME = "Restricted UserList Transaction";
    uint public constant DECIMALS = 18;

    address public owner;

    //number of registered users
    uint256 numberOfUsers;
    mapping (uint256 => address) userIndex;
    mapping (address => User) userList;

    struct User {
        address addr;
        uint256 balance;
        uint256 userNumber;
        mapping (address => uint) allowedAccounts;
    }

    modifier onlyOwner () {
        require(msg.sender == owner);
        _;
    }

    /*contract constructor
      All coins are assigned to owner initially
    */
    function RestrictedUserListTransaction () public {
        owner = msg.sender;
        numberOfUsers = 1;
        totalSupply = 100000000; //1 token states 1 kurus, in total 1 millon TL
        userIndex[numberOfUsers] = msg.sender;
        userList[msg.sender] = User(msg.sender, totalSupply, numberOfUsers);
    }


    function getTotalBalance() public constant returns (uint256) {
        return totalSupply;
    }

    function getSymbol() pure public returns (string) {
        return SYMBOL;
    }

    function getTokenName() pure public returns (string) {
        return NAME;
    }

    function getDecimals() pure public returns (uint) {
        return DECIMALS;
    }


    //Owner related part similar to Ownable contract in zepplin-solidity.
    event OwnershipTransferred (address indexed previousOwner, address indexed newOwner);
    function transferOwnership (address newOwner) onlyOwner public {
        require (newOwner != address(0));
        require (newOwner != owner);
        require(userList[newOwner].userNumber != 0);
        address old_owner = owner;
        owner = newOwner;
        OwnershipTransferred(old_owner, newOwner);
    }

    //Minting related part
    event Mint(uint256 amount);

    /*Total number of tokens are not limited.
      Owner of the contract is able to produce infinite token
      */
    function mint (uint256 amount) onlyOwner public returns (bool) {
        totalSupply = totalSupply.add(amount);
        userList[owner].balance = userList[owner].balance.add(amount);
        Mint(amount);
        return true;
    }

    // may need to check if user was registered
    function getUserNumber(address addr) public view returns (uint256) {
        return userList[addr].userNumber;
    }

    function isUserExists(address addr) public constant returns (bool) {
        return userList[addr].userNumber != 0;
    }

    function getOwnerNumber() public view returns (uint256) {
        return userList[owner].userNumber;
    }

    event AddUser(address addr, uint256 value);
    function addUser(address addr, uint256 value) onlyOwner public returns (bool) {
        require(value <= userList[owner].balance);
        require(addr != address(0));
        require(userList[addr].userNumber == 0);

        userList[owner].balance = userList[owner].balance.sub(value);
        numberOfUsers = numberOfUsers.add(1);
        userIndex[numberOfUsers] = addr;
        userList[addr] = User(addr, value, numberOfUsers);
        AddUser(addr, value);
        return true;
    }

    //ERC20 standart token related part
    function balanceOf(address who) public constant returns (uint256) {
        return userList[who].balance;
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0));
        require(isUserExists(to) == true);
        require(value <= userList[msg.sender].balance);

        userList[msg.sender].balance = userList[msg.sender].balance.sub(value);
        userList[to].balance = userList[to].balance.add(value);
        Transfer(msg.sender, to, value);
        return true;
   }

    /*if user already added spender than just increases the number
      if user does not has spender in his allowed account list than adds user to the list
    */
    function approve (address spender, uint256 value) public returns (bool) {
        require(spender != address(0));

        userList[msg.sender].allowedAccounts[spender] = userList[msg.sender].allowedAccounts[spender].add(value);
        Approval(msg.sender, spender,  value);
        return true;
    }

    function allowance(address patron, address spender) public constant returns (uint256) {
        require(patron != address(0));
        require(spender != address(0));

        return userList[patron].allowedAccounts[spender];
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {

        require(to != address(0));
        require(from != address(0));
        require(value <= userList[from].balance);
        require(value <= userList[from].allowedAccounts[msg.sender]);

        userList[from].balance = userList[from].balance.sub(value);
        userList[to].balance = userList[to].balance.add(value);
        userList[from].allowedAccounts[msg.sender] = userList[from].allowedAccounts[msg.sender].sub(value);
        return true;
    }
}
