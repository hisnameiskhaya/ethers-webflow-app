require("dotenv").config();

async function main() {
  console.log("🚀 Final BRICS Token Deployment Attempt...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.001")) {
    throw new Error("Insufficient balance for deployment");
  }
  
  const BRICSToken = await ethers.getContractFactory("SimpleBRICSToken");
  const treasuryAddress = "0xFa0f4D8c7F4684A8Ec140C34A426fdac48265861";
  
  console.log("Deploying BRICSToken with treasury:", treasuryAddress);
  
  try {
    const bricsToken = await BRICSToken.deploy(treasuryAddress);
    console.log("Deployment transaction sent:", bricsToken.deploymentTransaction().hash);
    
    await bricsToken.waitForDeployment();
    const contractAddress = await bricsToken.getAddress();
    
    console.log("✅ BRICSToken deployed to:", contractAddress);
    
    // Verify deployment
    const name = await bricsToken.name();
    const symbol = await bricsToken.symbol();
    const decimals = await bricsToken.decimals();
    const totalSupply = await bricsToken.totalSupply();
    const owner = await bricsToken.owner();
    const treasury = await bricsToken.treasuryAddress();
    
    console.log("\n📋 Contract Details:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Decimals:", decimals);
    console.log("- Total Supply:", ethers.formatUnits(totalSupply, decimals));
    console.log("- Owner:", owner);
    console.log("- Treasury:", treasury);
    
    return contractAddress;
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    console.log("Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
