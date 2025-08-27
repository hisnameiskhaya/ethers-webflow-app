require("dotenv").config();

async function main() {
  console.log("🚀 Hardhat BRICS Token Deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  const BRICSToken = await ethers.getContractFactory("SimpleBRICSToken");
  const treasuryAddress = "0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861";
  
  console.log("Deploying BRICSToken...");
  const bricsToken = await BRICSToken.deploy(treasuryAddress);
  
  await bricsToken.waitForDeployment();
  const contractAddress = await bricsToken.getAddress();
  
  console.log("BRICSToken deployed to:", contractAddress);
  
  // Verify deployment
  const name = await bricsToken.name();
  const symbol = await bricsToken.symbol();
  const decimals = await bricsToken.decimals();
  
  console.log("Contract details:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Decimals:", decimals);
  console.log("- Treasury:", treasuryAddress);
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("✅ Deployment successful:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
