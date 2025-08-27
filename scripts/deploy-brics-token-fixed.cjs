require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Deploying BRICS Token to Ethereum Mainnet (Fixed Gas)...");
  
  // Treasury address for USDT backing
  const TREASURY_ADDRESS = "0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861";
  
  console.log("📋 Deployment Parameters:");
  console.log(`   Treasury Address: ${TREASURY_ADDRESS}`);
  console.log(`   Network: Ethereum Mainnet`);
  console.log(`   Token Name: BRICS Stablecoin`);
  console.log(`   Token Symbol: BRICS`);
  console.log(`   Decimals: 6 (matches USDT)`);
  
  // Setup provider and signer directly
  const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log(`   Deployer Address: ${signer.address}`);
  
  // Get the contract factory
  const BRICSToken = require('/Users/ygorfrancisco/buybrics/artifacts/contracts/SimpleBRICSToken.sol/SimpleBRICSToken.json');
  const factory = new ethers.ContractFactory(BRICSToken.abi, BRICSToken.bytecode, signer);
  
  console.log("📦 Estimating gas requirements...");
  
  // Get current gas price
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log(`   Current gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  
  // Estimate gas for deployment
  const deployTx = factory.getDeployTransaction(TREASURY_ADDRESS);
  deployTx.from = signer.address;
  
  try {
    const estimatedGas = await provider.estimateGas(deployTx);
    const gasLimit = estimatedGas * BigInt(120) / BigInt(100); // Add 20% buffer
    
    console.log(`   Estimated gas: ${estimatedGas.toString()}`);
    console.log(`   Gas limit with buffer: ${gasLimit.toString()}`);
    
    // Calculate total cost
    const totalCost = gasLimit * gasPrice;
    console.log(`   Estimated total cost: ${ethers.formatEther(totalCost)} ETH`);
    
    // Check balance
    const balance = await provider.getBalance(signer.address);
    console.log(`   Deployer balance: ${ethers.formatEther(balance)} ETH`);
    
    if (totalCost > balance) {
      throw new Error(`Insufficient balance. Need ${ethers.formatEther(totalCost)} ETH, have ${ethers.formatEther(balance)} ETH`);
    }
    
    console.log("✅ Sufficient balance, proceeding with deployment...");
    
    // Deploy the contract with proper gas estimation
    const bricsToken = await factory.deploy(TREASURY_ADDRESS, {
      gasLimit: gasLimit
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await bricsToken.waitForDeployment();
    
    const contractAddress = await bricsToken.getAddress();
    
    console.log("✅ BRICS Token deployed successfully!");
    console.log(`   Contract Address: ${contractAddress}`);
    console.log(`   Treasury Address: ${TREASURY_ADDRESS}`);
    console.log(`   Owner: ${await bricsToken.owner()}`);
    
    // Verify treasury address
    const treasuryAddress = await bricsToken.treasuryAddress();
    console.log(`   Verified Treasury: ${treasuryAddress}`);
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    const totalSupply = await bricsToken.totalSupply();
    console.log(`   Initial Total Supply: ${ethers.formatUnits(totalSupply, 6)} BRICS`);
    
    const decimals = await bricsToken.decimals();
    console.log(`   Decimals: ${decimals}`);
    
    const name = await bricsToken.name();
    console.log(`   Name: ${name}`);
    
    const symbol = await bricsToken.symbol();
    console.log(`   Symbol: ${symbol}`);
    
    console.log("\n📋 Next Steps:");
    console.log("1. Verify contract on Etherscan");
    console.log("2. Update environment variables:");
    console.log(`   BRICS_TOKEN_ADDRESS=${contractAddress}`);
    console.log(`   VITE_BRICS_TOKEN_ADDRESS=${contractAddress}`);
    console.log("3. Test mint/burn functionality");
    console.log("4. Integrate with backend");
    
    return {
      contractAddress,
      treasuryAddress,
      owner: await bricsToken.owner()
    };
    
  } catch (error) {
    console.error("❌ Gas estimation failed:", error.message);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log(`Contract Address: ${result.contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
