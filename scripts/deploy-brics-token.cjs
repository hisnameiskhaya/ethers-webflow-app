const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BRICS Token to Ethereum Mainnet...");
  
  // Treasury address for USDT backing
  const TREASURY_ADDRESS = "0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861";
  
  console.log("📋 Deployment Parameters:");
  console.log(`   Treasury Address: ${TREASURY_ADDRESS}`);
  console.log(`   Network: Ethereum Mainnet`);
  console.log(`   Token Name: BRICS Stablecoin`);
  console.log(`   Token Symbol: BRICS`);
  console.log(`   Decimals: 6 (matches USDT)`);
  
  // Get the contract factory
  const BRICSToken = await ethers.getContractFactory("BRICSToken");
  
  console.log("📦 Estimating gas requirements...");
  
  // Get current gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log(`   Current gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  
  // Estimate gas for deployment
  const deployTransaction = BRICSToken.getDeployTransaction(TREASURY_ADDRESS);
  const estimatedGas = await ethers.provider.estimateGas(deployTransaction);
  const gasLimit = estimatedGas * BigInt(120) / BigInt(100); // Add 20% buffer
  
  console.log(`   Estimated gas: ${estimatedGas.toString()}`);
  console.log(`   Gas limit with buffer: ${gasLimit.toString()}`);
  
  // Calculate total cost
  const totalCost = gasLimit * gasPrice;
  console.log(`   Estimated total cost: ${ethers.formatEther(totalCost)} ETH`);
  
  // Check balance
  const signer = await ethers.getSigner();
  const balance = await signer.getBalance();
  console.log(`   Deployer balance: ${ethers.formatEther(balance)} ETH`);
  
  if (totalCost > balance) {
    throw new Error(`Insufficient balance. Need ${ethers.formatEther(totalCost)} ETH, have ${ethers.formatEther(balance)} ETH`);
  }
  
  console.log("✅ Sufficient balance, proceeding with deployment...");
  
  // Deploy the contract with proper gas estimation
  const bricsToken = await BRICSToken.deploy(TREASURY_ADDRESS, {
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
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contract on Etherscan");
  console.log("2. Update environment variables:");
  console.log(`   BRICS_TOKEN_ADDRESS=${contractAddress}`);
  console.log("3. Test mint/burn functionality");
  console.log("4. Integrate with backend");
  
  return {
    contractAddress,
    treasuryAddress,
    owner: await bricsToken.owner()
  };
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
