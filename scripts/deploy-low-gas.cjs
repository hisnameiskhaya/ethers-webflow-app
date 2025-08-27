require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Low Gas BRICS Token Deployment...");
  
  const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log(`Deployer: ${signer.address}`);
  console.log(`Treasury: 0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861`);
  
  const balance = await provider.getBalance(signer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Use lower gas price to fit within budget
  const gasPrice = ethers.parseUnits("10", "gwei");
  const gasLimit = 80000;
  const estimatedCost = gasPrice * BigInt(gasLimit);
  
  console.log(`Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
  console.log(`Gas Limit: ${gasLimit}`);
  console.log(`Estimated Cost: ${ethers.formatEther(estimatedCost)} ETH`);
  
  if (balance < estimatedCost) {
    throw new Error(`Insufficient balance. Need ${ethers.formatEther(estimatedCost)} ETH, have ${ethers.formatEther(balance)} ETH`);
  }
  
  const BRICSToken = require('/Users/ygorfrancisco/buybrics/artifacts/contracts/SimpleBRICSToken.sol/SimpleBRICSToken.json');
  const factory = new ethers.ContractFactory(BRICSToken.abi, BRICSToken.bytecode, signer);
  
  console.log("Deploying with fixed gas settings...");
  
  try {
    const contract = await factory.deploy("0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861", {
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });
    
    console.log("Waiting for deployment...");
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log(`✅ Deployed to: ${address}`);
    
    // Test basic functions
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    
    return address;
  } catch (error) {
    console.error("Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((address) => {
    console.log(`\n🎉 Success! Contract: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
