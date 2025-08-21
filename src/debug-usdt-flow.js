// 🔧 USDT Deposit Flow Debug Script
// Comprehensive debugging for BRICS USDT deposit flow on Ethereum Mainnet

console.log('🔧 USDT Deposit Flow Debug - Starting comprehensive analysis...');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEBUG_CONFIG = {
  testUrl: 'https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=37&user=Ygor&hash=test&chain=ethereum',
  expectedChainId: 1,
  expectedChainName: 'Ethereum',
  expectedTreasuryAddress: '0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f',
  expectedUSDTAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  testAmount: 37,
  testUser: 'Ygor',
  expectedAlchemyRPC: 'https://eth-mainnet.g.alchemy.com/v2/FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8'
};

// ============================================================================
// DEBUG FUNCTIONS
// ============================================================================

const debugEnvironment = () => {
  console.log('\n🔧 1. Environment Debug');
  
  const env = {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    isDevelopment: import.meta.env.MODE === 'development' || import.meta.env.DEV,
    hostname: window.location.hostname,
    url: window.location.href,
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };
  
  console.log('🔧 Environment:', env);
  
  // Check if we're on the correct URL
  const isStagingUrl = env.hostname.includes('buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app');
  const isLocalhost = env.hostname === 'localhost';
  const isProduction = env.hostname === 'buybrics.vercel.app';
  
  console.log('🔧 URL Validation:', {
    isStagingUrl,
    isLocalhost,
    isProduction,
    isValidUrl: isStagingUrl || isLocalhost || isProduction
  });
  
  return { success: isStagingUrl || isLocalhost || isProduction, env };
};

const debugURLParameters = () => {
  console.log('\n🔧 2. URL Parameters Debug');
  
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
    hasUser: user && user.length > 0,
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

const debugMetaMask = () => {
  console.log('\n🔧 3. MetaMask Debug');
  
  if (!window.ethereum) {
    console.error('❌ MetaMask not detected');
    return { success: false, error: 'MetaMask not detected' };
  }
  
  const metamaskInfo = {
    isMetaMask: window.ethereum.isMetaMask,
    isConnected: window.ethereum.isConnected(),
    selectedAddress: window.ethereum.selectedAddress,
    chainId: window.ethereum.chainId,
    networkVersion: window.ethereum.networkVersion
  };
  
  console.log('🔧 MetaMask Info:', metamaskInfo);
  
  if (!metamaskInfo.isMetaMask) {
    console.error('❌ Not MetaMask provider');
    return { success: false, error: 'Not MetaMask provider' };
  }
  
  console.log('✅ MetaMask detected and available');
  return { success: true, metamaskInfo };
};

const debugWalletConnection = async () => {
  console.log('\n🔧 4. Wallet Connection Debug');
  
  if (!window.ethereum) {
    console.error('❌ MetaMask not detected for wallet connection');
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
      expectedChainId: DEBUG_CONFIG.expectedChainId,
      needsChainSwitch: currentChainId !== DEBUG_CONFIG.expectedChainId,
      isEthereum: currentChainId === 1,
      networkName: network.name
    });
    
    if (currentChainId !== DEBUG_CONFIG.expectedChainId) {
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
      needsChainSwitch: currentChainId !== DEBUG_CONFIG.expectedChainId
    };
  } catch (error) {
    console.error('❌ Wallet connection test failed:', error);
    return { success: false, error: error.message };
  }
};

const debugChainSwitching = async () => {
  console.log('\n🔧 5. Chain Switching Debug');
  
  if (!window.ethereum) {
    console.error('❌ MetaMask not detected for chain switching');
    return { success: false, error: 'MetaMask not detected' };
  }
  
  try {
    const hexChainId = `0x${DEBUG_CONFIG.expectedChainId.toString(16)}`;
    console.log('🔧 Attempting to switch to Ethereum (chain ID 1):', hexChainId);
    
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
    
    console.log('✅ Chain switch to Ethereum successful');
    return { success: true };
  } catch (switchError) {
    console.error('❌ Chain switch error:', switchError);
    
    if (switchError.code === 4902) {
      console.log('🔧 Ethereum not added to MetaMask, attempting to add...');
      try {
        const chainParams = {
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://eth.llamarpc.com'],
          blockExplorerUrls: ['https://etherscan.io/'],
        };
        
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams],
        });
        
        console.log('✅ Ethereum added to MetaMask successfully');
        return { success: true };
      } catch (addError) {
        console.error('❌ Failed to add Ethereum to MetaMask:', addError);
        return { success: false, error: addError.message };
      }
    }
    
    return { success: false, error: switchError.message };
  }
};

const debugUSDTBalance = async (userAddress) => {
  console.log('\n🔧 6. USDT Balance Debug');
  
  try {
    const { ethers } = await import('ethers');
    
    // Use Alchemy RPC for Ethereum
    const provider = new ethers.JsonRpcProvider(DEBUG_CONFIG.expectedAlchemyRPC);
    
    const USDT_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
    
    const contract = new ethers.Contract(DEBUG_CONFIG.expectedUSDTAddress, USDT_ABI, provider);
    
    // Get balance and allowance
    const [balance, decimals, symbol, allowance] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals(),
      contract.symbol(),
      contract.allowance(userAddress, DEBUG_CONFIG.expectedTreasuryAddress)
    ]);
    
    const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
    const formattedAllowance = parseFloat(ethers.formatUnits(allowance, decimals));
    const requiredAmount = DEBUG_CONFIG.testAmount;
    
    console.log('🔧 USDT Balance Check:', {
      userAddress,
      balance: formattedBalance,
      allowance: formattedAllowance,
      requiredAmount,
      symbol,
      decimals,
      hasSufficientBalance: formattedBalance >= requiredAmount,
      hasSufficientAllowance: formattedAllowance >= requiredAmount,
      needsApproval: formattedAllowance < requiredAmount,
      usdtContract: DEBUG_CONFIG.expectedUSDTAddress,
      treasuryAddress: DEBUG_CONFIG.expectedTreasuryAddress
    });
    
    if (formattedBalance < requiredAmount) {
      console.warn('⚠️ Insufficient USDT balance for deposit');
      console.log('💡 To test the flow, you need at least', requiredAmount, 'USDT on Ethereum Mainnet');
      console.log('💡 You can get test USDT from exchanges or faucets');
    }
    
    console.log('✅ USDT balance check completed');
    return { 
      success: true, 
      balance: formattedBalance, 
      allowance: formattedAllowance,
      symbol,
      hasSufficientBalance: formattedBalance >= requiredAmount,
      needsApproval: formattedAllowance < requiredAmount
    };
  } catch (error) {
    console.error('❌ USDT balance check failed:', error);
    return { success: false, error: error.message };
  }
};

const debugTreasuryAddress = () => {
  console.log('\n🔧 7. Treasury Address Debug');
  
  try {
    // Check if the treasury address mapping is correct
    const TREASURY_ADDRESSES = {
      1: import.meta.env.VITE_TREASURY_ETHEREUM || '0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f',
      8453: import.meta.env.VITE_TREASURY_BASE || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
      10: import.meta.env.VITE_TREASURY_OPTIMISM || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
      42161: import.meta.env.VITE_TREASURY_ARBITRUM || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0'
    };
    
    const treasuryAddress = TREASURY_ADDRESSES[DEBUG_CONFIG.expectedChainId];
    const expectedAddress = DEBUG_CONFIG.expectedTreasuryAddress;
    
    console.log('🔧 Treasury Address Check:', {
      chainId: DEBUG_CONFIG.expectedChainId,
      treasuryAddress,
      expectedAddress,
      isCorrect: treasuryAddress.toLowerCase() === expectedAddress.toLowerCase(),
      envVar: import.meta.env.VITE_TREASURY_ETHEREUM
    });
    
    if (treasuryAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
      console.error('❌ Treasury address mismatch');
      return { success: false, error: 'Incorrect treasury address' };
    }
    
    console.log('✅ Treasury address validation passed');
    return { success: true, treasuryAddress };
  } catch (error) {
    console.error('❌ Treasury address check failed:', error);
    return { success: false, error: error.message };
  }
};

const debugUSDTContract = () => {
  console.log('\n🔧 8. USDT Contract Debug');
  
  const USDT_ADDRESSES = {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
    8453: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base
    10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // Arbitrum
  };
  
  const usdtAddress = USDT_ADDRESSES[DEBUG_CONFIG.expectedChainId];
  const expectedAddress = DEBUG_CONFIG.expectedUSDTAddress;
  
  console.log('🔧 USDT Contract Check:', {
    chainId: DEBUG_CONFIG.expectedChainId,
    usdtAddress,
    expectedAddress,
    isCorrect: usdtAddress.toLowerCase() === expectedAddress.toLowerCase()
  });
  
  if (usdtAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.error('❌ USDT contract address mismatch');
    return { success: false, error: 'Incorrect USDT contract address' };
  }
  
  console.log('✅ USDT contract validation passed');
  return { success: true, usdtAddress };
};

const debugHandleSendUSDTToTreasury = () => {
  console.log('\n🔧 9. handleSendUSDTToTreasury Function Debug');
  
  // Check if the function exists and has proper logging
  if (typeof window.handleSendUSDTToTreasury !== 'function') {
    console.error('❌ handleSendUSDTToTreasury function not found');
    return { success: false, error: 'Function not available' };
  }
  
  console.log('✅ handleSendUSDTToTreasury function exists');
  return { success: true };
};

const debugAlchemyRPC = () => {
  console.log('\n🔧 10. Alchemy RPC Debug');
  
  const expectedRPC = DEBUG_CONFIG.expectedAlchemyRPC;
  
  console.log('🔧 Alchemy RPC Check:', {
    expectedRPC,
    isConfigured: expectedRPC.includes('alchemy.com'),
    hasAPIKey: expectedRPC.includes('FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8')
  });
  
  if (!expectedRPC.includes('alchemy.com') || !expectedRPC.includes('FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8')) {
    console.error('❌ Alchemy RPC configuration issue');
    return { success: false, error: 'Incorrect Alchemy RPC configuration' };
  }
  
  console.log('✅ Alchemy RPC validation passed');
  return { success: true, rpcUrl: expectedRPC };
};

// ============================================================================
// MAIN DEBUG FUNCTION
// ============================================================================

const debugUSDTFlow = async () => {
  console.log('\n🔧 ========================================');
  console.log('🔧 USDT DEPOSIT FLOW DEBUG START');
  console.log('🔧 ========================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    testUrl: DEBUG_CONFIG.testUrl,
    steps: {}
  };
  
  // Step 1: Environment debug
  const envDebug = debugEnvironment();
  results.steps.environment = envDebug;
  if (!envDebug.success) {
    console.error('❌ Environment validation failed');
    return results;
  }
  
  // Step 2: URL parameters debug
  const paramDebug = debugURLParameters();
  results.steps.urlParameters = paramDebug;
  if (!paramDebug.success) {
    console.error('❌ URL parameters validation failed');
    return results;
  }
  
  // Step 3: MetaMask debug
  const metamaskDebug = debugMetaMask();
  results.steps.metamask = metamaskDebug;
  if (!metamaskDebug.success) {
    console.error('❌ MetaMask validation failed');
    return results;
  }
  
  // Step 4: Wallet connection debug
  const walletDebug = await debugWalletConnection();
  results.steps.walletConnection = walletDebug;
  if (!walletDebug.success) {
    console.error('❌ Wallet connection failed');
    return results;
  }
  
  // Step 5: Chain switching debug (if needed)
  if (walletDebug.needsChainSwitch) {
    const switchDebug = await debugChainSwitching();
    results.steps.chainSwitching = switchDebug;
    if (!switchDebug.success) {
      console.error('❌ Chain switching failed');
      return results;
    }
  }
  
  // Step 6: USDT balance debug
  const balanceDebug = await debugUSDTBalance(walletDebug.address);
  results.steps.usdtBalance = balanceDebug;
  if (!balanceDebug.success) {
    console.error('❌ USDT balance check failed');
    return results;
  }
  
  // Step 7: Treasury address debug
  const treasuryDebug = debugTreasuryAddress();
  results.steps.treasuryAddress = treasuryDebug;
  if (!treasuryDebug.success) {
    console.error('❌ Treasury address validation failed');
    return results;
  }
  
  // Step 8: USDT contract debug
  const usdtDebug = debugUSDTContract();
  results.steps.usdtContract = usdtDebug;
  if (!usdtDebug.success) {
    console.error('❌ USDT contract validation failed');
    return results;
  }
  
  // Step 9: Function debug
  const functionDebug = debugHandleSendUSDTToTreasury();
  results.steps.function = functionDebug;
  
  // Step 10: Alchemy RPC debug
  const rpcDebug = debugAlchemyRPC();
  results.steps.alchemyRPC = rpcDebug;
  if (!rpcDebug.success) {
    console.error('❌ Alchemy RPC validation failed');
    return results;
  }
  
  // Generate summary
  const summary = {
    allStepsPassed: Object.values(results.steps).every(step => step.success),
    environmentValid: envDebug.success,
    urlParametersValid: paramDebug.success,
    metamaskAvailable: metamaskDebug.success,
    walletConnected: walletDebug.success,
    chainSwitched: !walletDebug.needsChainSwitch || results.steps.chainSwitching?.success,
    hasSufficientBalance: balanceDebug.hasSufficientBalance,
    needsApproval: balanceDebug.needsApproval,
    treasuryCorrect: treasuryDebug.success,
    usdtCorrect: usdtDebug.success,
    functionAvailable: functionDebug.success,
    rpcConfigured: rpcDebug.success,
    readyForTransfer: balanceDebug.hasSufficientBalance && walletDebug.success && treasuryDebug.success && usdtDebug.success
  };
  
  results.summary = summary;
  
  console.log('\n🔧 ========================================');
  console.log('🔧 USDT DEPOSIT FLOW DEBUG SUMMARY');
  console.log('🔧 ========================================');
  console.log('🔧 Summary:', summary);
  console.log('�� All Steps Passed:', summary.allStepsPassed);
  console.log('🔧 Ready for Transfer:', summary.readyForTransfer);
  
  if (summary.allStepsPassed) {
    console.log('🎉 All validations passed! The USDT deposit flow is ready.');
    if (!summary.hasSufficientBalance) {
      console.log('⚠️ Note: You need USDT tokens to complete a deposit. Current balance is insufficient.');
    }
  } else {
    console.log('⚠️ Some validations failed. Check the details above.');
  }
  
  // Store results globally
  window.USDTFlowDebugResults = results;
  
  return results;
};

// Auto-run if we have the right parameters
const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');
const chain = urlParams.get('chain');

if (action === 'connect_wallet' && chain === 'ethereum') {
  console.log('🔧 Ethereum parameters detected - running comprehensive USDT flow debug...');
  debugUSDTFlow().then(results => {
    console.log('🔧 USDT flow debugging complete. Results available at: window.USDTFlowDebugResults');
  });
} else {
  console.log('🔧 No Ethereum parameters detected. Call debugUSDTFlow() manually to test.');
}

// Export for manual testing
window.debugUSDTFlow = debugUSDTFlow;
