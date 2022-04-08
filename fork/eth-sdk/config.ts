import { defineConfig } from '@dethcrypto/eth-sdk'

export default defineConfig({
  contracts: {
    mainnet: {
      weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      kp3r: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
      rKp3r: '0xEdB67Ee1B171c4eC66E6c10EC43EDBbA20FaE8e9',
      kp3rV2: '0xeb02addCfD8B773A5FFA6B9d1FE99c566f8c44CC',
      uniV3PairFactory: '0x053D7DD4dde2B5e4F6146476B95EA8c62cd7c428',
    },
  },
});
