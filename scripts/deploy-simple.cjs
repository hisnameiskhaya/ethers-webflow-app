require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Simple BRICS Token Deployment...");
  
  // Use a more reliable RPC endpoint
  const provider = new ethers.JsonRpcProvider("https://cloudflare-eth.com");
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log(`Deployer: ${signer.address}`);
  console.log(`Treasury: 0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861`);
  
  // Get balance
  const balance = await provider.getBalance(signer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Simple contract deployment without complex gas estimation
  const BRICSToken = require('/Users/ygorfrancisco/buybrics/artifacts/contracts/SimpleBRICSToken.sol/SimpleBRICSToken.json');
  const factory = new ethers.ContractFactory(BRICSToken.abi, BRICSToken.bytecode, signer);
  
  console.log("Deploying...");
  
  try {
    const contract = await factory.deploy("0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861");
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
