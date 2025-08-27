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
     * @dev Override increaseAllowance function
     */
    /**
     * @dev Override decreaseAllowance function
     */
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
