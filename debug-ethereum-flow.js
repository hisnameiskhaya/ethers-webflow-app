// 🔧 Ethereum USDT Investment Flow Debug Script
// Debug the specific flow for chain=ethereum parameter

console.log('🔧 Ethereum USDT Investment Flow Debug - Starting...');

// ============================================================================
// TEST PARAMETERS
// ============================================================================

const testUrl = 'https://buybrics-git-staging-fixes-hisnameiskhayas-projects.vercel.app/?action=connect_wallet&amount=100&user=0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1&hash=abc&chain=ethereum';

console.log('🔧 Test URL:', testUrl);

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');
const amount = urlParams.get('amount');
const user = urlParams.get('user');
const hash = urlParams.get('hash');
const chain = urlParams.get('chain');

console.log('🔧 URL Parameters:', { action, amount, user, hash, chain });

// ============================================================================
// CHAIN MAPPING VALIDATION
// ============================================================================

const chainMap = {
  'ethereum': 1,
  'base': 8453,
  'optimism': 10,
  'arbitrum': 42161,
  'sepolia': 11155111
};

const targetChainId = chain ? chainMap[chain.toLowerCase()] : 8453;
console.log('🔧 Chain Mapping:', {
  providedChain: chain,
  targetChainId,
  chainName: Object.keys(chainMap).find(key => chainMap[key] === targetChainId)
});

// ============================================================================
// TREASURY ADDRESS VALIDATION
// ============================================================================

const TREASURY_ADDRESSES = {
  1: import.meta.env.VITE_TREASURY_ETHEREUM || '0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f',
  8453: import.meta.env.VITE_TREASURY_BASE || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
  10: import.meta.env.VITE_TREASURY_OPTIMISM || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
  42161: import.meta.env.VITE_TREASURY_ARBITRUM || '0x3FaED7E00BFB7fA8646F0473D1Cc7e4EC4057DE0',
  11155111: import.meta.env.VITE_TREASURY_SEPOLIA || '0xe4f1C79c47FA2dE285Cd8Fb6F6476495BD08538f'
};

const treasuryAddress = TREASURY_ADDRESSES[targetChainId];
console.log('🔧 Treasury Address:', {
  targetChainId,
  treasuryAddress,
  isEthereum: targetChainId === 1,
  expectedEthereumAddress: '0xe4f1c79c47fa2de285cd8fb6f6476495bd08538f'
});

// ============================================================================
// USDT CONTRACT ADDRESSES
// ============================================================================

const USDT_ADDRESSES = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
  8453: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base
  10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism
  42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // Arbitrum
};

const usdtAddress = USDT_ADDRESSES[targetChainId];
console.log('🔧 USDT Contract Address:', {
  targetChainId,
  usdtAddress,
  isEthereumUSDT: usdtAddress === '0xdAC17F958D2ee523a2206206994597C13D831ec7'
});

// ============================================================================
// WALLET CONNECTION TEST
// ============================================================================

const testWalletConnection = async () => {
  console.log('🔧 Testing wallet connection...');
  
  if (!window.ethereum) {
    console.error('🔧 MetaMask not detected');
    return { success: false, error: 'MetaMask not detected' };
  }
  
  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    
    console.log('🔧 Wallet Connection Success:', {
      address: address.substring(0, 10) + '...',
      currentChainId: Number(network.chainId),
      targetChainId,
      needsChainSwitch: Number(network.chainId) !== targetChainId
    });
    
    return { success: true, provider, signer, address, network };
  } catch (error) {
    console.error('🔧 Wallet Connection Error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// USDT BALANCE TEST (ETHEREUM ONLY)
// ============================================================================

const testEthereumUSDTBalance = async (userAddress) => {
  console.log('🔧 Testing Ethereum USDT balance for:', userAddress);
  
  try {
    const { ethers } = await import('ethers');
    
    // Use Alchemy RPC for Ethereum
    const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/FlBOuTS3mAuXwKlI5pIitlyVpSYwgtC8');
    
    const USDT_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];
    
    const contract = new ethers.Contract(usdtAddress, USDT_ABI, provider);
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals(),
      contract.symbol()
    ]);
    
    const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
    
    console.log('🔧 Ethereum USDT Balance:', {
      userAddress,
      balance: formattedBalance,
      symbol,
      decimals,
      hasSufficientBalance: formattedBalance >= 100
    });
    
    return { success: true, balance: formattedBalance, symbol };
  } catch (error) {
    console.error('🔧 Ethereum USDT Balance Error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// MAIN DEBUG FUNCTION
// ============================================================================

const debugEthereumFlow = async () => {
  console.log('\n🔧 Starting Ethereum USDT investment flow debug...');
  
  // 1. Validate parameters
  if (action !== 'connect_wallet' || !amount || !user || !hash || chain !== 'ethereum') {
    console.error('🔧 Invalid parameters for Ethereum flow');
    return { success: false, error: 'Invalid parameters' };
  }
  
  // 2. Test wallet connection
  const walletResult = await testWalletConnection();
  if (!walletResult.success) {
    return walletResult;
  }
  
  // 3. Test Ethereum USDT balance
  const balanceResult = await testEthereumUSDTBalance(user);
  if (!balanceResult.success) {
    return balanceResult;
  }
  
  // 4. Generate comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    testUrl,
    parameters: { action, amount, user, hash, chain },
    chainMapping: { providedChain: chain, targetChainId, chainName: 'Ethereum' },
    treasuryAddress,
    usdtAddress,
    walletConnection: {
      address: walletResult.address,
      currentChainId: Number(walletResult.network.chainId),
      targetChainId,
      needsChainSwitch: Number(walletResult.network.chainId) !== targetChainId
    },
    usdtBalance: balanceResult,
    issues: []
  };
  
  // Identify issues
  if (targetChainId !== 1) {
    report.issues.push('CHAIN_MAPPING_ERROR: Expected chain ID 1 for Ethereum');
  }
  
  if (!treasuryAddress || treasuryAddress === '0x0000000000000000000000000000000000000000') {
    report.issues.push('TREASURY_ADDRESS_ERROR: Invalid treasury address');
  }
  
  if (!usdtAddress || usdtAddress === '0x0000000000000000000000000000000000000000') {
    report.issues.push('USDT_ADDRESS_ERROR: Invalid USDT contract address');
  }
  
  if (balanceResult.balance < 100) {
    report.issues.push(`INSUFFICIENT_BALANCE: User has ${balanceResult.balance} USDT, needs 100 USDT`);
  }
  
  if (Number(walletResult.network.chainId) !== targetChainId) {
    report.issues.push(`CHAIN_MISMATCH: Current chain ${walletResult.network.chainId}, target chain ${targetChainId}`);
  }
  
  console.log('\n🔧 Ethereum Flow Debug Report:', report);
  
  // Store report globally
  window.EthereumDebugReport = report;
  
  return report;
};

// Auto-run if we have the right parameters
if (action === 'connect_wallet' && amount && user && hash && chain === 'ethereum') {
  console.log('🔧 Ethereum parameters detected - running debug...');
  debugEthereumFlow().then(report => {
    console.log('🔧 Ethereum flow debugging complete. Report available at: window.EthereumDebugReport');
  });
} else {
  console.log('🔧 No Ethereum parameters detected. Call debugEthereumFlow() manually to test.');
}

// Export for manual testing
window.debugEthereumFlow = debugEthereumFlow;
