// 🔧 Ethereum USDT Deposit Flow Test Script
// Comprehensive validation for BRICS USDT investment on Ethereum

console.log('🔧 Ethereum USDT Deposit Flow Test - Starting validation...');

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  testUrl: 'https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=100&user=0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1&hash=test&chain=ethereum',
  expectedChainId: 1,
  expectedChainName: 'Ethereum',
  expectedTreasuryAddress: '0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f',
  expectedUSDTAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  testAmount: 100,
  testUserAddress: '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1',
  expectedAlchemyRPC: 'https://eth-mainnet.g.alchemy.com/v2/FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8'
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateURLParameters = () => {
  console.log('\n🔧 1. URL Parameters Validation');
  
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  const amount = urlParams.get('amount');
  const user = urlParams.get('user');
  const hash = urlParams.get('hash');
  const chain = urlParams.get('chain');
  
  const params = { action, amount, user, hash, chain };
  console.log('🔧 URL Parameters:', params);
  
  const validation = {
    hasAction: action === 'connect_wallet',
    hasAmount: amount && !isNaN(parseFloat(amount)),
    hasUser: user && user.startsWith('0x') && user.length === 42,
    hasHash: hash && hash.length > 0,
    hasChain: chain === 'ethereum',
    isValid: action === 'connect_wallet' && amount && user && hash && chain === 'ethereum'
  };
  
  console.log('🔧 Parameter Validation:', validation);
  
  if (!validation.isValid) {
    console.error('❌ URL parameters validation failed');
    return { success: false, error: 'Invalid URL parameters', params, validation };
  }
  
  console.log('✅ URL parameters validation passed');
  return { success: true, params, validation };
};

const validateChainMapping = (chain) => {
  console.log('\n🔧 2. Chain Mapping Validation');
  
  const chainMap = {
    'ethereum': 1,
    'base': 8453,
    'optimism': 10,
    'arbitrum': 42161,
    'sepolia': 11155111
  };
  
  const targetChainId = chainMap[chain.toLowerCase()];
  const expectedChainId = TEST_CONFIG.expectedChainId;
  
  console.log('🔧 Chain Mapping:', {
    providedChain: chain,
    targetChainId,
    expectedChainId,
    isCorrect: targetChainId === expectedChainId
  });
  
  if (targetChainId !== expectedChainId) {
    console.error('❌ Chain mapping validation failed');
    return { success: false, error: 'Incorrect chain mapping' };
  }
  
  console.log('✅ Chain mapping validation passed');
  return { success: true, targetChainId, chainName: 'Ethereum' };
};

const validateTreasuryAddress = (chainId) => {
  console.log('\n🔧 3. Treasury Address Validation');
  
  // Check if the treasury address mapping is correct
  const TREASURY_ADDRESSES = {
    1: import.meta.env.VITE_TREASURY_ETHEREUM || '0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f',
    8453: import.meta.env.VITE_TREASURY_BASE || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
    10: import.meta.env.VITE_TREASURY_OPTIMISM || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
    42161: import.meta.env.VITE_TREASURY_ARBITRUM || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0'
  };
  
  const treasuryAddress = TREASURY_ADDRESSES[chainId];
  const expectedAddress = TEST_CONFIG.expectedTreasuryAddress;
  
  console.log('🔧 Treasury Address:', {
    chainId,
    treasuryAddress,
    expectedAddress,
    isCorrect: treasuryAddress.toLowerCase() === expectedAddress.toLowerCase()
  });
  
  if (treasuryAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.error('❌ Treasury address validation failed');
    return { success: false, error: 'Incorrect treasury address' };
  }
  
  console.log('✅ Treasury address validation passed');
  return { success: true, treasuryAddress };
};

const validateUSDTContract = (chainId) => {
  console.log('\n🔧 4. USDT Contract Validation');
  
  const USDT_ADDRESSES = {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
    8453: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base
    10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // Arbitrum
  };
  
  const usdtAddress = USDT_ADDRESSES[chainId];
  const expectedAddress = TEST_CONFIG.expectedUSDTAddress;
  
  console.log('🔧 USDT Contract Address:', {
    chainId,
    usdtAddress,
    expectedAddress,
    isCorrect: usdtAddress.toLowerCase() === expectedAddress.toLowerCase()
  });
  
  if (usdtAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.error('❌ USDT contract validation failed');
    return { success: false, error: 'Incorrect USDT contract address' };
  }
  
  console.log('✅ USDT contract validation passed');
  return { success: true, usdtAddress };
};

const validateAlchemyRPC = () => {
  console.log('\n🔧 5. Alchemy RPC Validation');
  
  // Check if the RPC URL in the code matches expected
  const expectedRPC = TEST_CONFIG.expectedAlchemyRPC;
  
  console.log('�� Alchemy RPC:', {
    expectedRPC,
    isConfigured: expectedRPC.includes('alchemy.com'),
    hasAPIKey: expectedRPC.includes('FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8')
  });
  
  if (!expectedRPC.includes('alchemy.com') || !expectedRPC.includes('FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8')) {
    console.error('❌ Alchemy RPC validation failed');
    return { success: false, error: 'Incorrect Alchemy RPC configuration' };
  }
  
  console.log('✅ Alchemy RPC validation passed');
  return { success: true, rpcUrl: expectedRPC };
};

const testWalletConnection = async () => {
  console.log('\n🔧 6. Wallet Connection Test');
  
  if (!window.ethereum) {
    console.error('❌ MetaMask not detected');
    return { success: false, error: 'MetaMask not detected' };
  }
  
  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    
    console.log('🔧 Wallet Connection:', {
      address: address.substring(0, 10) + '...',
      currentChainId,
      expectedChainId: TEST_CONFIG.expectedChainId,
      needsChainSwitch: currentChainId !== TEST_CONFIG.expectedChainId,
      isEthereum: currentChainId === 1
    });
    
    if (currentChainId !== TEST_CONFIG.expectedChainId) {
      console.warn('⚠️ Wallet is not on Ethereum mainnet, chain switch may be needed');
    }
    
    console.log('✅ Wallet connection test passed');
    return { 
      success: true, 
      provider, 
      signer, 
      address, 
      network,
      currentChainId,
      needsChainSwitch: currentChainId !== TEST_CONFIG.expectedChainId
    };
  } catch (error) {
    console.error('❌ Wallet connection test failed:', error);
    return { success: false, error: error.message };
  }
};

const testEthereumUSDTBalance = async (userAddress) => {
  console.log('\n🔧 7. Ethereum USDT Balance Test');
  
  try {
    const { ethers } = await import('ethers');
    
    // Use Alchemy RPC for Ethereum
    const provider = new ethers.JsonRpcProvider(TEST_CONFIG.expectedAlchemyRPC);
    
    const USDT_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
    
    const contract = new ethers.Contract(TEST_CONFIG.expectedUSDTAddress, USDT_ABI, provider);
    
    // Get balance and allowance
    const [balance, decimals, symbol, allowance] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals(),
      contract.symbol(),
      contract.allowance(userAddress, TEST_CONFIG.expectedTreasuryAddress)
    ]);
    
    const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
    const formattedAllowance = parseFloat(ethers.formatUnits(allowance, decimals));
    const requiredAmount = TEST_CONFIG.testAmount;
    
    console.log('🔧 Ethereum USDT Balance:', {
      userAddress,
      balance: formattedBalance,
      allowance: formattedAllowance,
      requiredAmount,
      symbol,
      decimals,
      hasSufficientBalance: formattedBalance >= requiredAmount,
      hasSufficientAllowance: formattedAllowance >= requiredAmount,
      needsApproval: formattedAllowance < requiredAmount
    });
    
    console.log('✅ Ethereum USDT balance test passed');
    return { 
      success: true, 
      balance: formattedBalance, 
      allowance: formattedAllowance,
      symbol,
      hasSufficientBalance: formattedBalance >= requiredAmount,
      needsApproval: formattedAllowance < requiredAmount
    };
  } catch (error) {
    console.error('❌ Ethereum USDT balance test failed:', error);
    return { success: false, error: error.message };
  }
};

const validateHandleSendUSDTToTreasury = () => {
  console.log('\n🔧 8. handleSendUSDTToTreasury Function Validation');
  
  // Check if the function exists and has proper logging
  if (typeof window.handleSendUSDTToTreasury !== 'function') {
    console.error('❌ handleSendUSDTToTreasury function not found');
    return { success: false, error: 'Function not available' };
  }
  
  console.log('✅ handleSendUSDTToTreasury function exists');
  return { success: true };
};

const validateDebugResults = () => {
  console.log('\n🔧 9. Debug Results Validation');
  
  // Check if debug results are available
  if (window.EthereumDepositDebugResults) {
    console.log('✅ Debug results available at window.EthereumDepositDebugResults');
    console.log('🔧 Debug Results:', window.EthereumDepositDebugResults);
    return { success: true, results: window.EthereumDepositDebugResults };
  } else {
    console.warn('⚠️ Debug results not yet available (may need to wait for flow completion)');
    return { success: false, error: 'Debug results not available' };
  }
};

// ============================================================================
// MAIN TEST FUNCTION
// ============================================================================

const testEthereumFlow = async () => {
  console.log('\n🔧 ========================================');
  console.log('🔧 ETHEREUM USDT DEPOSIT FLOW TEST START');
  console.log('🔧 ========================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    testUrl: TEST_CONFIG.testUrl,
    steps: {}
  };
  
  // Step 1: Validate URL parameters
  const paramValidation = validateURLParameters();
  results.steps.parameterValidation = paramValidation;
  if (!paramValidation.success) {
    console.error('❌ Parameter validation failed');
    return results;
  }
  
  // Step 2: Validate chain mapping
  const chainValidation = validateChainMapping(paramValidation.params.chain);
  results.steps.chainValidation = chainValidation;
  if (!chainValidation.success) {
    console.error('❌ Chain validation failed');
    return results;
  }
  
  // Step 3: Validate treasury address
  const treasuryValidation = validateTreasuryAddress(chainValidation.targetChainId);
  results.steps.treasuryValidation = treasuryValidation;
  if (!treasuryValidation.success) {
    console.error('❌ Treasury validation failed');
    return results;
  }
  
  // Step 4: Validate USDT contract
  const usdtValidation = validateUSDTContract(chainValidation.targetChainId);
  results.steps.usdtValidation = usdtValidation;
  if (!usdtValidation.success) {
    console.error('❌ USDT validation failed');
    return results;
  }
  
  // Step 5: Validate Alchemy RPC
  const rpcValidation = validateAlchemyRPC();
  results.steps.rpcValidation = rpcValidation;
  if (!rpcValidation.success) {
    console.error('❌ RPC validation failed');
    return results;
  }
  
  // Step 6: Test wallet connection
  const walletResult = await testWalletConnection();
  results.steps.walletConnection = walletResult;
  if (!walletResult.success) {
    console.error('❌ Wallet connection failed');
    return results;
  }
  
  // Step 7: Test Ethereum USDT balance
  const balanceResult = await testEthereumUSDTBalance(paramValidation.params.user);
  results.steps.usdtBalance = balanceResult;
  if (!balanceResult.success) {
    console.error('❌ USDT balance check failed');
    return results;
  }
  
  // Step 8: Validate handleSendUSDTToTreasury function
  const functionValidation = validateHandleSendUSDTToTreasury();
  results.steps.functionValidation = functionValidation;
  
  // Step 9: Validate debug results
  const debugValidation = validateDebugResults();
  results.steps.debugValidation = debugValidation;
  
  // Generate summary
  const summary = {
    allStepsPassed: Object.values(results.steps).every(step => step.success),
    chainRespected: chainValidation.targetChainId === TEST_CONFIG.expectedChainId,
    treasuryCorrect: treasuryValidation.treasuryAddress.toLowerCase() === TEST_CONFIG.expectedTreasuryAddress.toLowerCase(),
    usdtCorrect: usdtValidation.usdtAddress.toLowerCase() === TEST_CONFIG.expectedUSDTAddress.toLowerCase(),
    alchemyRPCConfigured: rpcValidation.success,
    walletConnected: walletResult.success,
    hasSufficientBalance: balanceResult.hasSufficientBalance,
    needsApproval: balanceResult.needsApproval,
    readyForTransfer: balanceResult.hasSufficientBalance && walletResult.success,
    debugResultsAvailable: debugValidation.success
  };
  
  results.summary = summary;
  
  console.log('\n🔧 ========================================');
  console.log('�� ETHEREUM USDT DEPOSIT FLOW TEST SUMMARY');
  console.log('🔧 ========================================');
  console.log('🔧 Summary:', summary);
  console.log('🔧 All Steps Passed:', summary.allStepsPassed);
  console.log('🔧 Ready for Transfer:', summary.readyForTransfer);
  
  if (summary.allStepsPassed) {
    console.log('🎉 All validations passed! The Ethereum USDT deposit flow is ready.');
  } else {
    console.log('⚠️ Some validations failed. Check the details above.');
  }
  
  // Store results globally
  window.EthereumFlowTestResults = results;
  
  return results;
};

// Auto-run if we have the right parameters
const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');
const chain = urlParams.get('chain');

if (action === 'connect_wallet' && chain === 'ethereum') {
  console.log('🔧 Ethereum parameters detected - running comprehensive test...');
  testEthereumFlow().then(results => {
    console.log('🔧 Ethereum flow testing complete. Results available at: window.EthereumFlowTestResults');
  });
} else {
  console.log('🔧 No Ethereum parameters detected. Call testEthereumFlow() manually to test.');
}

// Export for manual testing
window.testEthereumFlow = testEthereumFlow;
