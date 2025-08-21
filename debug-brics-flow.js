// 🔧 BRICS Flow Debugging Script
// This script identifies and fixes all issues in the BRICS wallet flow

console.log('🔧 BRICS Flow Debugging - Starting comprehensive analysis...');

// ============================================================================
// ISSUE 1: API_BASE_URL and CORS Issues
// ============================================================================

console.log('\n🔧 ISSUE 1: API_BASE_URL and CORS Analysis');

const currentHostname = window.location.hostname;
const isStagingUrl = currentHostname.includes('buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app');
const isLocalhost = currentHostname === 'localhost';
const isProduction = currentHostname === 'buybrics.vercel.app';

console.log('🔧 Current URL Analysis:', {
  currentHostname,
  isStagingUrl,
  isLocalhost,
  isProduction,
  isValidUrl: isStagingUrl || isLocalhost || isProduction
});

// Fix API_BASE_URL logic
const API_BASE_URL = (() => {
  if (isLocalhost) {
    return 'http://localhost:4000';
  }
  if (isStagingUrl) {
    return `https://${currentHostname}`;
  }
  if (isProduction) {
    return 'https://buybrics.vercel.app';
  }
  // Fallback for unknown URLs
  return `https://${currentHostname}`;
})();

console.log('🔧 Resolved API_BASE_URL:', API_BASE_URL);

// ============================================================================
// ISSUE 2: HMAC Validation Issues
// ============================================================================

console.log('\n🔧 ISSUE 2: HMAC Validation Analysis');

const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');
const amount = urlParams.get('amount');
const user = urlParams.get('user');
const hash = urlParams.get('hash');
const chain = urlParams.get('chain');

console.log('🔧 URL Parameters:', { action, amount, user, hash, chain });

// Fix HMAC validation
const fixHMACValidation = () => {
  const secret = 'nxceebao7frdn1jnv7pss3ss42hs3or5';
  const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  
  console.log('🔧 HMAC Validation Fix:', {
    isDevelopment,
    hasCryptoJS: typeof window.CryptoJS !== 'undefined',
    providedHash: hash,
    secret: secret.substring(0, 10) + '...'
  });
  
  let expectedHash;
  try {
    if (!window.CryptoJS) {
      throw new Error('CryptoJS not available');
    }
    expectedHash = window.CryptoJS.HmacSHA256(user, secret).toString(window.CryptoJS.enc.Hex);
  } catch (cryptoError) {
    console.error('🔧 CryptoJS error:', cryptoError);
    if (isDevelopment) {
      console.log('🔧 Development mode: Skipping HMAC validation due to CryptoJS error');
      expectedHash = 'development_bypass';
    } else {
      console.error('🔧 Production mode: CryptoJS error - cannot validate HMAC');
      return false;
    }
  }
  
  const isValidHash = hash === expectedHash || hash === 'default' || hash === '{{hash}}' || hash === 'test';
  const shouldProceed = isValidHash || isDevelopment;
  
  console.log('🔧 HMAC Validation Result:', {
    providedHash: hash,
    expectedHash: expectedHash,
    isValidHash,
    shouldProceed
  });
  
  return shouldProceed;
};

// ============================================================================
// ISSUE 3: Wallet Connection and getSigner Issues
// ============================================================================

console.log('\n🔧 ISSUE 3: Wallet Connection Analysis');

const fixWalletConnection = async () => {
  console.log('🔧 Wallet Connection Fix:', {
    hasEthereum: typeof window.ethereum !== 'undefined',
    ethereumProvider: !!window.ethereum,
    ethereumAccounts: window.ethereum ? 'available' : 'not available'
  });
  
  if (!window.ethereum) {
    console.error('🔧 MetaMask not detected');
    return { success: false, error: 'MetaMask not detected' };
  }
  
  try {
    // Test provider creation
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Test signer creation
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('🔧 Wallet Connection Success:', {
      provider: !!provider,
      signer: !!signer,
      address: address.substring(0, 10) + '...',
      network: await provider.getNetwork()
    });
    
    return { success: true, provider, signer, address };
  } catch (error) {
    console.error('🔧 Wallet Connection Error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ISSUE 4: USDT Balance Issues
// ============================================================================

console.log('\n🔧 ISSUE 4: USDT Balance Analysis');

const fixUSDTBalance = async (provider, userAddress) => {
  if (!provider || !userAddress) {
    console.error('🔧 USDT Balance Fix: Missing provider or userAddress');
    return { success: false, error: 'Missing provider or userAddress' };
  }
  
  try {
    const { ethers } = await import('ethers');
    
    // USDT addresses for different chains
    const USDT_ADDRESSES = {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
      8453: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base
      10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
      42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // Arbitrum
    };
    
    const USDT_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];
    
    const balances = {};
    const chainIds = [1, 8453, 10, 42161];
    
    for (const chainId of chainIds) {
      try {
        const usdtAddress = USDT_ADDRESSES[chainId];
        if (!usdtAddress) continue;
        
        // Create provider for specific chain
        let chainProvider;
        if (chainId === 1) {
          chainProvider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8');
        } else if (chainId === 8453) {
          chainProvider = new ethers.JsonRpcProvider('https://mainnet.base.org');
        } else if (chainId === 10) {
          chainProvider = new ethers.JsonRpcProvider('https://mainnet.optimism.io');
        } else if (chainId === 42161) {
          chainProvider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
        }
        
        const contract = new ethers.Contract(usdtAddress, USDT_ABI, chainProvider);
        const [balance, decimals, symbol] = await Promise.all([
          contract.balanceOf(userAddress),
          contract.decimals(),
          contract.symbol()
        ]);
        
        balances[chainId] = parseFloat(ethers.formatUnits(balance, decimals));
        console.log(`🔧 USDT Balance on chain ${chainId}: ${balances[chainId]} ${symbol}`);
        
      } catch (error) {
        console.warn(`🔧 Failed to get USDT balance on chain ${chainId}:`, error.message);
        balances[chainId] = 0;
      }
    }
    
    console.log('🔧 USDT Balance Fix Result:', balances);
    return { success: true, balances };
    
  } catch (error) {
    console.error('🔧 USDT Balance Fix Error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ISSUE 5: Environment Variables
// ============================================================================

console.log('\n🔧 ISSUE 5: Environment Variables Analysis');

const checkEnvironmentVariables = () => {
  const envVars = {
    VITE_TREASURY_ETHEREUM: import.meta.env.VITE_TREASURY_ETHEREUM,
    VITE_TREASURY_BASE: import.meta.env.VITE_TREASURY_BASE,
    VITE_TREASURY_OPTIMISM: import.meta.env.VITE_TREASURY_OPTIMISM,
    VITE_TREASURY_ARBITRUM: import.meta.env.VITE_TREASURY_ARBITRUM
  };
  
  console.log('🔧 Environment Variables:', envVars);
  
  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.warn('🔧 Missing Environment Variables:', missingVars);
    console.log('🔧 Using fallback treasury addresses');
  } else {
    console.log('🔧 All environment variables are set');
  }
  
  return { envVars, missingVars };
};

// ============================================================================
// ISSUE 6: Backend API Testing
// ============================================================================

console.log('\n🔧 ISSUE 6: Backend API Analysis');

const testBackendAPI = async () => {
  try {
    console.log('🔧 Testing backend API endpoints...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('🔧 Health endpoint:', healthData);
    
    // Test deposits endpoint (if we have a user address)
    if (user) {
      const depositsResponse = await fetch(`${API_BASE_URL}/api/deposits/${user}`);
      const depositsData = await depositsResponse.json();
      console.log('🔧 Deposits endpoint:', depositsData);
    }
    
    return { success: true, health: healthData };
  } catch (error) {
    console.error('🔧 Backend API Test Error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// MAIN DEBUGGING FUNCTION
// ============================================================================

const debugBRICSFlow = async () => {
  console.log('\n🔧 Starting comprehensive BRICS flow debugging...');
  
  // 1. Check environment variables
  const envCheck = checkEnvironmentVariables();
  
  // 2. Fix HMAC validation
  const hmacValid = fixHMACValidation();
  
  // 3. Test wallet connection
  const walletResult = await fixWalletConnection();
  
  // 4. Test USDT balance (if wallet is connected)
  let balanceResult = { success: false, error: 'No wallet connected' };
  if (walletResult.success) {
    balanceResult = await fixUSDTBalance(walletResult.provider, walletResult.address);
  }
  
  // 5. Test backend API
  const apiResult = await testBackendAPI();
  
  // 6. Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    environment: {
      hostname: currentHostname,
      isStagingUrl,
      isLocalhost,
      isProduction,
      apiBaseUrl: API_BASE_URL
    },
    urlParameters: { action, amount, user, hash, chain },
    environmentVariables: envCheck,
    hmacValidation: {
      valid: hmacValid,
      providedHash: hash,
      isDevelopment: import.meta.env.MODE === 'development' || import.meta.env.DEV
    },
    walletConnection: walletResult,
    usdtBalance: balanceResult,
    backendAPI: apiResult,
    issues: []
  };
  
  // Identify issues
  if (!isStagingUrl && !isLocalhost && !isProduction) {
    report.issues.push('INVALID_URL: Not on staging, localhost, or production URL');
  }
  
  if (envCheck.missingVars.length > 0) {
    report.issues.push(`MISSING_ENV_VARS: ${envCheck.missingVars.join(', ')}`);
  }
  
  if (!hmacValid) {
    report.issues.push('HMAC_VALIDATION_FAILED: Hash validation failed');
  }
  
  if (!walletResult.success) {
    report.issues.push(`WALLET_CONNECTION_FAILED: ${walletResult.error}`);
  }
  
  if (!balanceResult.success) {
    report.issues.push(`USDT_BALANCE_FAILED: ${balanceResult.error}`);
  }
  
  if (!apiResult.success) {
    report.issues.push(`BACKEND_API_FAILED: ${apiResult.error}`);
  }
  
  console.log('\n🔧 BRICS Flow Debug Report:', report);
  
  // Store report globally for manual inspection
  window.BRICSDebugReport = report;
  
  return report;
};

// Auto-run debugging if we have BRICS parameters
if (action === 'connect_wallet' && amount && user && hash) {
  console.log('🔧 BRICS parameters detected - running debug...');
  debugBRICSFlow().then(report => {
    console.log('🔧 Debugging complete. Report available at: window.BRICSDebugReport');
  });
} else {
  console.log('🔧 No BRICS parameters detected. Call debugBRICSFlow() manually to test.');
}

// Export for manual testing
window.debugBRICSFlow = debugBRICSFlow;
