import hre from 'hardhat';
import { getMainnetSdk } from '@dethcrypto/eth-sdk-client';
import { impersonate, setBalance, toUnit } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import kp3rV2Abi from '../eth-sdk/abis/mainnet/kp3rV2.json';

const KP3R_RKP3R_POOL = '0x106BC339460106C73b8034Cc4C5A100d48967aa4';
const gasLimit = 10_000_000;

(async () => {
  console.log('Script Started');
  const [ourWallet] = ((await hre.ethers.getSigners()) as unknown) as SignerWithAddress[];

  const { uniV3PairFactory } = getMainnetSdk(ourWallet);
  const kp3rV2 = await hre.ethers.getContractAt(kp3rV2Abi, '0xeb02addCfD8B773A5FFA6B9d1FE99c566f8c44CC');

  const governance = await impersonate(await kp3rV2.callStatic.governance());
  await setBalance(await governance._address, toUnit(1_000));

  await uniV3PairFactory.connect(governance).createPairManager(KP3R_RKP3R_POOL);

  const pairAddress = await uniV3PairFactory.callStatic.pairManagers(KP3R_RKP3R_POOL, {
    gasLimit,
  });

  await kp3rV2.connect(governance).approveLiquidity(pairAddress, {
    gasLimit,
  });

  console.log({ pairAddress });
  console.log('Script Ended');
})();
