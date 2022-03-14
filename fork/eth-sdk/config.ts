import { defineConfig } from '@dethcrypto/eth-sdk'

export default defineConfig({
  contracts: {
    mainnet: {
      weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      kp3r: '0x1cEB5cB57C4D4E2b2433641b95Dd330A33185A44',
      rKp3r: '0xEdB67Ee1B171c4eC66E6c10EC43EDBbA20FaE8e9',
      kp3rV2: '0x4A6cFf9E1456eAa3b6f37572395C6fa0c959edAB',
      uniV3PairFactory: '0x005634CfeF45e5a19C84aEdE6f0af17833471852',
    },
  },
});
