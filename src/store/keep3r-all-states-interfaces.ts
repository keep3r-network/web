// interface BigNumber {}

// interface LiquidityData {
//   address: string;
//   underlyingBalance: BigNumber; // need some logic from last repo
//   symbol: string; // need some logic from last repo
//   decimals: string; // lpTokenContract.methods.decimals().call(),
// }

// interface UserLiquidityData {
//   address: string; // liquidity address
//   userIdleAmount: BigNumber; // liqManagerMethods.userLiquidityIdleAmount(currentAccount, liquidityAddress).call(),
//   userTotalAmount: BigNumber; // liqManagerMethods.userLiquidityTotalAmount(currentAccount, liquidityAddress).call(),
//   balanceOf: BigNumber; // lpTokenContract.methods.balanceOf(currentAccount).call(),
//   potentialUserCredits: BigNumber; // need some logic from last repo
//   allowancesMap: { [spenderAddress: string]: BigNumber }; // we asume that is a map of approves from user of lpToken to element
// }

// interface JobData {
//   name: string; // jobRegistryMethods.jobData(jobAddress).call())['_name'];
//   address: string;
//   credits: BigNumber; // keep3rMethods.credits(jobAddress, keep3rAddress).call(),

//   cycle: BigNumber; // liqManagerMethods.jobCycle(jobAddress).call(),
//   creditsRefillAt: BigNumber; // function calculateCreditsRefill() on last repo
//   jobEscrowStep1: BigNumber; // function calculateCreditsRefill() on last repo
//   jobEscrowStep2: BigNumber; // function calculateCreditsRefill() on last repo
//   liquiditiesAddresses: string[]; // liqManagerMethods.jobLiquidities(jobAddress).call();
// }

// interface UserJobData {
//   userCycle: BigNumber; // liqManagerMethods.userJobCycle(currentAccount, jobAddress).call(),
// }

// interface JobLiquidityData {
//   liquidityDesiredAmount: BigNumber; // function getJobLiquidityData() on last repo
// }

// interface UserJobLiquidityData {
//   userLiquidity: BigNumber; // function getJobLiquidityData() on last repo
//   userLockedLiquidity: BigNumber; // function getJobLiquidityData() on last repo
// }

// interface ExternalKeeperData {
//   address: string;
//   firstSeen: string;
//   lastJob: string;
//   completedJobs: string;
//   bonded: BigNumber;
// }

// interface KeeperTokenData {
//   address: string;
//   symbol: string;
//   decimals: string;
//   name: string;
// }

// interface UserKeeperTokenData {
//   balanceOf: BigNumber; // keeper.balanceOf(account);
//   pendingBondAmount: BigNumber; // keeper.pendingBonds(account, tokenAddress);
//   pendingBondTimestamp: string; // keeper.bondings(account, tokenAddress);
//   bonded: BigNumber; // keeper.bonds(account, tokenAddress);
//   pendingUnbondAmount: BigNumber; // keeper.partianUnbonding(account, tokenAddress);
//   pendingUnbondTimestamp: string; // keeper.unbondings(account, tokenAddress);
//   allowancesMap: { [tokenAddress: string]: BigNumber };
// }

// interface Status {
//   loading: boolean;
//   error: string;
// }

// interface LiquidityActionMap {
//   get: Status;
//   approve: Status;
//   deposit: Status;
//   withdraw: Status;
// }

// interface UserLiquidityActionMap {
//   get: Status;
// }

// interface LiquiditiesState {
//   liquidityAddresses: string[];
//   liquiditiesMap: { [liquidityAddress: string]: LiquidityData };
//   user: {
//     userLiquiditiesMap: { [liquidityAddress: string]: UserLiquidityData };
//   };
//   statusMap: {
//     getLiquiditiesAddresses: Status;
//     getLiquiditiesData: Status;
//     liquiditiesStatusMap: { [liquidityAddress: string]: LiquidityActionMap };
//     user: {
//       getUserLiquidities: Status;
//       UserLiquiditiesStatusMap: { [liquidityAddress: string]: UserLiquidityActionMap };
//     };
//   };
// }

// interface JobsState {
//   jobsAddresses: string[];
//   jobsMap: { [jobAddress: string]: JobData };
//   jobsLiquiditiesDataMap: { [jobAddress: string]: JobLiquidityData };
//   user: {
//     userJobsMap: { [jobAddress: string]: UserJobData };
//     UserJobsLiquiditiesDataMap: { [jobAddress: string]: UserJobLiquidityData };
//   };
//   statusMap: {
//     getJobs: Status;
//     user: {
//       getUserJobs: Status;
//     };
//   };
// }

// interface KeepersState {
//   keeperTokenAddresses: string[]; // list of keeper tokens supported by the app.
//   keeperTokensMap: { [tokenAddress: string]: KeeperTokenData }; // map of token data not related to user.
//   keepersAddresses: string[]; // list of keeper accounts searched
//   keepersMap: { [keeperAddress: string]: ExternalKeeperData }; // Map of keeper accounts searched
//   user: {
//     userKeeperTokensMap: { [tokenAddress: string]: UserKeeperTokenData }; // map of keeper tokens user related data.
//   };
//   statusMap: {};
// }
