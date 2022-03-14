import '@nomiclabs/hardhat-ethers';
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/types';

dotenv.config({ path: './.env' });

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.FORK_RPC as string,
        enabled: true,
        blockNumber: 14186656,
      },
      chainId: 1337,
    },
  }
};

export default config;
