// Mobile Wallet Connection Fix
// Replace the mobile redirect logic in src/App.jsx

// Find this section in your App.jsx (around line 560-610):
/*
if (isMobileDevice && !isMetaMaskBrowser && !isEmbedded) {
  console.log('BRICS Integration - Mobile device detected, redirecting to MetaMask app');
  localStorage.setItem('walletConnectionAttempt', 'true');
  const vercelAppUrl = 'https://buy.brics.ninja';
  const metamaskUrl = `https://metamask.app.link/dapp/${vercelAppUrl.replace(/^https?:\/\//, '')}`;
  // ... lots of redirect code ...
  window.location.href = metamaskUrl;
  return;
} else {
  console.log('BRICS Integration - Not mobile or already in MetaMask, using connectWallet');
  await connectWallet();
}
*/

// Replace it with this:
/*
if (isMobileDevice && !isMetaMaskBrowser && !isEmbedded) {
  console.log('BRICS Integration - Mobile device detected, attempting in-browser connection');
  
  // Check if user prefers MetaMask app redirect
  const preferAppRedirect = localStorage.getItem('preferMetaMaskApp') === 'true';
  
  if (preferAppRedirect) {
    console.log('BRICS Integration - User prefers MetaMask app, redirecting');
    const vercelAppUrl = 'https://buy.brics.ninja';
    const metamaskUrl = `https://metamask.app.link/dapp/${vercelAppUrl.replace(/^https?:\/\//, '')}`;
    window.location.href = metamaskUrl;
    return;
  }
  
  // Try in-browser connection first
  console.log('BRICS Integration - Attempting in-browser wallet connection');
  try {
    await connectWallet();
  } catch (error) {
    console.log('BRICS Integration - In-browser connection failed, offering MetaMask app option');
    
    // Show user option to use MetaMask app
    const useApp = confirm('In-browser connection failed. Would you like to open in MetaMask app instead?');
    if (useApp) {
      localStorage.setItem('preferMetaMaskApp', 'true');
      const vercelAppUrl = 'https://buy.brics.ninja';
      const metamaskUrl = `https://metamask.app.link/dapp/${vercelAppUrl.replace(/^https?:\/\//, '')}`;
      window.location.href = metamaskUrl;
    }
  }
} else {
  console.log('BRICS Integration - Not mobile or already in MetaMask, using connectWallet');
  await connectWallet();
}
*/

console.log('Mobile wallet fix instructions created. Apply the changes to src/App.jsx and deploy.');
