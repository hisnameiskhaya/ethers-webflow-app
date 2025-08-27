// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleBRICSToken is ERC20, Ownable {
    address public immutable treasuryAddress;
    
    constructor(address _treasuryAddress) ERC20("BRICS Stablecoin", "BRICS") Ownable(msg.sender) {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(from) >= amount, "Insufficient balance to burn");
        _burn(from, amount);
    }
    
    function transfer(address to, uint256 amount) public pure override returns (bool) {
        revert("BRICS tokens are non-transferable receipts");
    }
    
    function transferFrom(address from, address to, uint256 amount) public pure override returns (bool) {
        revert("BRICS tokens are non-transferable receipts");
    }
    
    function approve(address spender, uint256 amount) public pure override returns (bool) {
        revert("BRICS tokens are non-transferable receipts");
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
