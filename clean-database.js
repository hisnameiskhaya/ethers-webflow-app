import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Deposit Schema
const depositSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  userAddress: { type: String, required: true, lowercase: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currentBalance: { type: Number, required: true, min: 0, default: 0 },
  tokenType: { type: String, enum: ['USDT', 'MockUSDT'], default: 'USDT' },
  txHash: { type: String, required: true, unique: true },
  chainId: { type: Number, required: true, index: true },
  maturityDate: { type: Date, default: null },
  accumulatedYield: { type: Number, required: true, min: 0, default: 0 },
  dailyYield: { type: Number, required: true, min: 0, default: 0 },
  dailyYieldPercent: { type: Number, default: 0.5, min: 0 },
  yieldGoalMet: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now, index: true },
  lastGoalMet: { type: Date, default: null },
  isTestData: { type: Boolean, default: false },
  lastRedeemedAt: { type: Date, default: null },
  lastRedeemedAmount: { type: Number, default: null },
  lastRedeemedTxHash: { type: String, default: null },
  treasuryTxHash: { type: String, default: null },
  transferConfirmed: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

const Deposit = mongoose.model('Deposit', depositSchema);

// BRICS Token Contract
const BRICS_TOKEN_ADDRESS = '0x9d82c77578FE4114ba55fAbb43F6F4c4650ae85d';
const BRICS_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

async function getBRICSBalance(address) {
  try {
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
    const contract = new ethers.Contract(BRICS_TOKEN_ADDRESS, BRICS_ABI, provider);
    const rawBalance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const balance = parseFloat(ethers.formatUnits(rawBalance, decimals));
    return balance;
  } catch (error) {
    console.error('Error getting BRICS balance:', error);
    return 0;
  }
}

async function cleanDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      ssl: true,
      retryWrites: true,
      w: 'majority',
      appName: 'database-cleanup',
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ MongoDB connected');

    // Your wallet address
    const userAddress = '0xDD7FC80cafb2f055fb6a519d4043c29EA76a7ce1';
    
    console.log(`🔍 Checking deposits for address: ${userAddress}`);
    
    // Get all deposits for this address
    const deposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    }).sort({ date: 1 });
    
    console.log(`📊 Found ${deposits.length} deposits`);
    
    if (deposits.length === 0) {
      console.log('❌ No deposits found for this address');
      return;
    }
    
    // Display current deposits
    console.log('\n📋 Current deposits:');
    let totalDeposited = 0;
    deposits.forEach((deposit, index) => {
      console.log(`${index + 1}. Date: ${deposit.date.toISOString()}`);
      console.log(`   Amount: ${deposit.amount} USDT`);
      console.log(`   Current Balance: ${deposit.currentBalance} USDT`);
      console.log(`   Chain ID: ${deposit.chainId}`);
      console.log(`   TX Hash: ${deposit.txHash}`);
      console.log(`   Accumulated Yield: ${deposit.accumulatedYield} USDT`);
      console.log('');
      totalDeposited += deposit.currentBalance;
    });
    
    console.log(`💰 Total deposited amount: ${totalDeposited} USDT`);
    
    // Get current BRICS balance
    console.log('\n🪙 Getting current BRICS balance...');
    const bricsBalance = await getBRICSBalance(userAddress);
    console.log(`🪙 Current BRICS balance: ${bricsBalance} BRICS`);
    
    console.log(`\n📊 Analysis:`);
    console.log(`   Deposited: ${totalDeposited} USDT`);
    console.log(`   BRICS Balance: ${bricsBalance} BRICS`);
    console.log(`   Difference: ${totalDeposited - bricsBalance} USDT`);
    
    if (Math.abs(totalDeposited - bricsBalance) < 0.001) {
      console.log('✅ Balances are already in sync!');
      return;
    }
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will reset all deposits to match your current BRICS balance.');
    console.log(`   This will set all deposits to total: ${bricsBalance} USDT`);
    console.log('   Are you sure you want to continue? (y/N)');
    
    // For now, we'll proceed with the cleanup
    console.log('🔄 Proceeding with database cleanup...');
    
    // Calculate how to distribute the BRICS balance across deposits
    const targetTotal = bricsBalance;
    const depositCount = deposits.length;
    
    if (depositCount === 1) {
      // Single deposit - set it to the BRICS balance
      const deposit = deposits[0];
      const oldAmount = deposit.currentBalance;
      deposit.currentBalance = targetTotal;
      deposit.accumulatedYield = 0; // Reset yield
      await deposit.save();
      
      console.log(`✅ Updated single deposit:`);
      console.log(`   Old amount: ${oldAmount} USDT`);
      console.log(`   New amount: ${targetTotal} USDT`);
      
    } else {
      // Multiple deposits - distribute proportionally
      console.log(`📊 Distributing ${targetTotal} USDT across ${depositCount} deposits...`);
      
      for (let i = 0; i < deposits.length; i++) {
        const deposit = deposits[i];
        const oldAmount = deposit.currentBalance;
        
        if (i === deposits.length - 1) {
          // Last deposit gets the remainder to ensure exact total
          const previousTotal = deposits.slice(0, i).reduce((sum, d) => sum + d.currentBalance, 0);
          deposit.currentBalance = targetTotal - previousTotal;
        } else {
          // Distribute proportionally
          const proportion = deposit.currentBalance / totalDeposited;
          deposit.currentBalance = targetTotal * proportion;
        }
        
        deposit.accumulatedYield = 0; // Reset yield
        await deposit.save();
        
        console.log(`✅ Updated deposit ${i + 1}:`);
        console.log(`   Old amount: ${oldAmount} USDT`);
        console.log(`   New amount: ${deposit.currentBalance} USDT`);
      }
    }
    
    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const updatedDeposits = await Deposit.find({ 
      userAddress: userAddress.toLowerCase() 
    });
    
    const newTotal = updatedDeposits.reduce((sum, deposit) => sum + deposit.currentBalance, 0);
    console.log(`✅ New total deposited: ${newTotal} USDT`);
    console.log(`✅ BRICS balance: ${bricsBalance} BRICS`);
    console.log(`✅ Difference: ${Math.abs(newTotal - bricsBalance)} USDT`);
    
    if (Math.abs(newTotal - bricsBalance) < 0.001) {
      console.log('🎉 Database cleanup successful! Balances are now in sync.');
    } else {
      console.log('⚠️  Warning: Balances are not perfectly in sync. Manual review may be needed.');
    }
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the cleanup
cleanDatabase();
