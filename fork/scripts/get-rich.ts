import hre from 'hardhat';
import { getMainnetSdk } from '@dethcrypto/eth-sdk-client';
import { impersonate, setBalance, toUnit } from './utils';

const KP3R_WHALE_ADDRESS = '0x4aE958B4dE0e6f21d51e73625fb9D5E0C3B0985f';
const WETH_WHALE_ADDRESS = '0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E';
const RKP3R_WHALE_ADDRESS = '0xd4260B2781e2460f49dB746112BB592ba3fb6382';

(async () => {
  console.log('Script Started');

  // initialize contracts
  const ourWallet = (await hre.ethers.getSigners())[0];
  const { kp3r, weth, rKp3r } = getMainnetSdk(ourWallet);

  // impersonate
  const kp3rWhale = await impersonate(KP3R_WHALE_ADDRESS);
  const wethWhale = await impersonate(WETH_WHALE_ADDRESS);
  const rKp3rWhale = await impersonate(RKP3R_WHALE_ADDRESS);

  console.log('Old KP3R balance', (await kp3r.balanceOf(ourWallet.address)).toString());
  console.log('Old WETH balance', (await weth.balanceOf(ourWallet.address)).toString());
  console.log('Old RPK3R balance', (await rKp3r.balanceOf(ourWallet.address)).toString());

  await setBalance(wethWhale._address, toUnit(10));
  await setBalance(rKp3rWhale._address, toUnit(10));

  // transfer tokens
  await kp3r.connect(kp3rWhale).transfer(ourWallet.address, toUnit(1_000));
  await weth.connect(wethWhale).transfer(ourWallet.address, toUnit(1_000));
  await rKp3r.connect(rKp3rWhale).transfer(ourWallet.address, toUnit(1_000));
  
  console.log('New KP3R balance', (await kp3r.balanceOf(ourWallet.address)).toString());
  console.log('New WETH balance', (await weth.balanceOf(ourWallet.address)).toString());
  console.log('New RKP3R balance', (await rKp3r.balanceOf(ourWallet.address)).toString());
  console.log('Script Ended');
})();
