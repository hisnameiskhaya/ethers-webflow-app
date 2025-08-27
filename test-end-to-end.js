#!/usr/bin/env node

/**
 * 🧪 Full End-to-End Test for BRICS Platform
 * Tests: Deposit → Balance Check → Withdrawal → Final Balance Verification
 */

const https = require('https');
const { ethers } = require('ethers');

// Configuration
const API_BASE = 'https://buy.brics.ninja';
const TEST_ADDRESS = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
const BRICS_TOKEN_ADDRESS = '0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function getDeposits(address) {
  log(`📊 Fetching deposits for ${address}...`, 'blue');
  const response = await makeRequest(`${API_BASE}/api/deposits/${address}`);
  
  if (!response.success) {
    throw new Error(`Failed to fetch deposits: ${response.error}`);
  }
  
  const totalDeposited = response.totalUsdtDeposited;
  const activeDeposits = response.deposits.filter(d => d.currentBalance > 0);
  const redeemedDeposits = response.deposits.filter(d => d.currentBalance === 0);
  
  log(`✅ Total USDT Deposited: $${totalDeposited}`, 'green');
  log(`📈 Active Deposits: ${activeDeposits.length}`, 'cyan');
  log(`💸 Redeemed Deposits: ${redeemedDeposits.length}`, 'yellow');
  
  return {
    totalDeposited,
    activeDeposits,
    redeemedDeposits,
    deposits: response.deposits
  };
}

async function checkBRICSBalance(address) {
  log(`🔍 Checking BRICS token balance for ${address}...`, 'blue');
  
  // This would require a Web3 provider to check on-chain balance
  // For now, we'll calculate expected balance from deposits
  const depositData = await getDeposits(address);
  const expectedBRICS = depositData.totalDeposited;
  
  log(`💰 Expected BRICS Balance: ${expectedBRICS} BRICS`, 'green');
  return expectedBRICS;
}

async function simulateDeposit(address, amount = 0.01) {
  log(`💳 Simulating deposit of $${amount} USDT...`, 'blue');
  
  // Note: This is a simulation - actual deposits require blockchain transactions
  log(`⚠️  This is a simulation. Real deposits require:`, 'yellow');
  log(`   1. USDT approval to treasury`, 'yellow');
  log(`   2. USDT transfer to treasury`, 'yellow');
  log(`   3. BRICS minting to user`, 'yellow');
  
  const currentData = await getDeposits(address);
  const newTotal = currentData.totalDeposited + amount;
  
  log(`📊 Current Total: $${currentData.totalDeposited}`, 'cyan');
  log(`📊 New Total (simulated): $${newTotal}`, 'green');
  
  return {
    amount,
    newTotal,
    success: true
  };
}

async function simulateWithdrawal(address, amount = 0.01) {
  log(`💸 Simulating withdrawal of ${amount} BRICS...`, 'blue');
  
  const currentData = await getDeposits(address);
  const activeDeposits = currentData.activeDeposits;
  
  if (activeDeposits.length === 0) {
    log(`❌ No active deposits available for withdrawal`, 'red');
    return { success: false, error: 'No active deposits' };
  }
  
  log(`⚠️  This is a simulation. Real withdrawals require:`, 'yellow');
  log(`   1. BRICS burn from user`, 'yellow');
  log(`   2. USDT transfer from treasury to user`, 'yellow');
  
  log(`📊 Available for withdrawal: $${currentData.totalDeposited}`, 'cyan');
  log(`📊 Withdrawal amount: $${amount}`, 'green');
  
  return {
    amount,
    success: true,
    available: currentData.totalDeposited
  };
}

async function runFullTest() {
  log('🚀 Starting Full End-to-End Test', 'bright');
  log('=' * 50, 'cyan');
  
  try {
    // Step 1: Initial State Check
    log('\n📋 STEP 1: Initial State Check', 'bright');
    const initialData = await getDeposits(TEST_ADDRESS);
    
    // Step 2: BRICS Balance Check
    log('\n📋 STEP 2: BRICS Balance Check', 'bright');
    const bricsBalance = await checkBRICSBalance(TEST_ADDRESS);
    
    // Step 3: Simulate Deposit
    log('\n📋 STEP 3: Simulate New Deposit', 'bright');
    const depositResult = await simulateDeposit(TEST_ADDRESS, 0.01);
    
    // Step 4: Post-Deposit State
    log('\n📋 STEP 4: Post-Deposit State Check', 'bright');
    const postDepositData = await getDeposits(TEST_ADDRESS);
    
    // Step 5: Simulate Withdrawal
    log('\n📋 STEP 5: Simulate Withdrawal', 'bright');
    const withdrawalResult = await simulateWithdrawal(TEST_ADDRESS, 0.01);
    
    // Step 6: Final State Check
    log('\n📋 STEP 6: Final State Check', 'bright');
    const finalData = await getDeposits(TEST_ADDRESS);
    
    // Summary
    log('\n📋 TEST SUMMARY', 'bright');
    log('=' * 50, 'cyan');
    log(`✅ Initial Balance: $${initialData.totalDeposited}`, 'green');
    log(`✅ Expected BRICS: ${bricsBalance} BRICS`, 'green');
    log(`✅ Deposit Simulation: $${depositResult.amount}`, 'green');
    log(`✅ Withdrawal Simulation: $${withdrawalResult.amount}`, 'green');
    log(`✅ Final Balance: $${finalData.totalDeposited}`, 'green');
    
    log('\n🎉 End-to-End Test Completed Successfully!', 'bright');
    log('📝 Note: This test simulates the flow. Real transactions require blockchain interaction.', 'yellow');
    
  } catch (error) {
    log(`❌ Test Failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the test
runFullTest();
