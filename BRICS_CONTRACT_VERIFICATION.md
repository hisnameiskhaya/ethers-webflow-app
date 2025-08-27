# 🔍 BRICS Token Contract Verification Guide

## 📋 **Contract Information**

### **Deployed Contract Address:**
```
0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d
```

### **Network:** 
- **Primary:** Ethereum Mainnet (Chain ID: 1)
- **Also deployed on:** Base, Optimism, Arbitrum

### **Solidity Compiler Version:**
```
0.8.20
```

### **License:**
```
MIT License
```

### **SPDX License Identifier:**
```
// SPDX-License-Identifier: MIT
```
✅ **Included in source code**

## 🏗️ **Constructor Arguments**

### **Treasury Address (Constructor Parameter):**
```
0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861
```

### **Constructor Call:**
```javascript
constructor(
    address _treasuryAddress
) ERC20("BRICS Stablecoin", "BRICS") Ownable(msg.sender)
```

### **Constructor Arguments for Verification:**
```
["0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861"]
```

## 📄 **Flattened Source Code**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BRICS Stablecoin
 * @dev Non-transferable receipt token backed 1:1 by USDT
 * @dev Only owner (backend) can mint/burn tokens
 * @dev Users cannot transfer tokens - they are receipts only
 */
contract BRICSToken is ERC20, Ownable {
    
    // Treasury address that holds USDT backing
    address public immutable treasuryAddress;
    
    // Events for transparency
    event BRICSMinted(address indexed to, uint256 amount, uint256 timestamp);
    event BRICSBurned(address indexed from, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Constructor sets up the token with proper metadata
     * @param _treasuryAddress The address of the treasury holding USDT backing
     */
    constructor(address _treasuryAddress) ERC20("BRICS Stablecoin", "BRICS") Ownable(msg.sender) {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
    }
    
    /**
     * @dev Mint BRICS tokens to a user (only owner/backend)
     * @param to The address to mint tokens to
     * @param amount The amount of BRICS to mint (6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        
        emit BRICSMinted(to, amount, block.timestamp);
    }
    
    /**
     * @dev Burn BRICS tokens from a user (only owner/backend)
     * @param from The address to burn tokens from
     * @param amount The amount of BRICS to burn (6 decimals)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance to burn");
        
        _burn(from, amount);
        
        emit BRICSBurned(from, amount, block.timestamp);
    }
    
    /**
     * @dev Override transfer function to prevent transfers
     * @dev This makes BRICS a non-transferable receipt token
     */
    function transfer(address to, uint256 amount) public pure override returns (bool) {
        revert("BRICS tokens are non-transferable receipts");
    }
    
    /**
     * @dev Override transferFrom function to prevent transfers
     * @dev This makes BRICS a non-transferable receipt token
     */
    function transferFrom(address from, address to, uint256 amount) public pure override returns (bool) {
        revert("BRICS tokens are non-transferable receipts");
    }
    
    /**
     * @dev Override approve function to prevent approvals
     * @dev Since transfers are disabled, approvals are not needed
     */
    function approve(address spender, uint256 amount) public pure override returns (bool) {
        revert("BRICS tokens are non-transferable receipts");
    }
    
    /**
     * @dev Get treasury address for verification
     */
    function getTreasuryAddress() external view returns (address) {
        return treasuryAddress;
    }
    
    /**
     * @dev Get total supply of BRICS tokens
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }
    
    /**
     * @dev Get balance of BRICS tokens for an address
     */
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }
    
    /**
     * @dev Override decimals to match USDT (6 decimals)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
```

## 🔗 **Etherscan Verification Steps**

### **1. Go to Etherscan:**
```
https://etherscan.io/verifyContract
```

### **2. Enter Contract Details:**
- **Contract Address:** `0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d`
- **Compiler Type:** `Solidity (Single file)`
- **Compiler Version:** `v0.8.20+commit.a1b79de6`
- **Open Source License Type:** `MIT License (MIT)`

### **3. Enter Constructor Arguments:**
```
["0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861"]
```

### **4. Upload Source Code:**
- Copy the flattened source code above
- Paste it into the "Contract Source Code" field

### **5. Verify Settings:**
- **Optimization:** `No` (or check if enabled during deployment)
- **Runs:** `200` (default)
- **EVM Version:** `paris` (default for 0.8.20)

## 📊 **Contract Details**

### **Token Information:**
- **Name:** BRICS Stablecoin
- **Symbol:** BRICS
- **Decimals:** 6 (matches USDT)
- **Type:** Non-transferable receipt token

### **Key Features:**
- ✅ **Non-transferable:** Users cannot transfer tokens
- ✅ **Owner-controlled:** Only backend can mint/burn
- ✅ **USDT-backed:** 1:1 backing by USDT in treasury
- ✅ **Transparent:** Events for all mint/burn operations

### **Treasury Addresses by Chain:**
```javascript
{
  1: '0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861',    // Ethereum Mainnet
  8453: '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0', // Base
  10: '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',   // Optimism
  42161: '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0', // Arbitrum
  11155111: '0xe4f1C79c47FA2dE285Cd8Fb6F6476495BD08538f' // Sepolia
}
```

## 🎯 **Verification Checklist**

- ✅ **Contract Address:** `0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d`
- ✅ **Compiler Version:** `0.8.20`
- ✅ **License:** `MIT` (SPDX included)
- ✅ **Constructor Arguments:** `["0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861"]`
- ✅ **Source Code:** Provided above
- ✅ **Network:** Ethereum Mainnet

## 🔍 **Additional Verification Links**

### **Etherscan Contract Page:**
```
https://etherscan.io/address/0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d
```

### **BaseScan (if deployed on Base):**
```
https://basescan.org/address/0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d
```

**Ready for Etherscan verification!** 🚀
