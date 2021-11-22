export class LiquidityData {
  address: string;
  underlyingBalance: string;
  symbol: string;
  protocol: string;
  totalSupply: string;

  constructor(data: any) {
    this.address = data.address;
    this.underlyingBalance = data.underlyingBalance;
    this.symbol = data.symbol;
    this.protocol = data.protocol;
    this.totalSupply = data.totalSupply;
  }
}

export class UserLiquidityData {
  address: string; // liquidity address
  userIdleAmount: string; // liqManagerMethods.userLiquidityIdleAmount(currentAccount, liquidityAddress).call(),
  userTotalAmount: string; // liqManagerMethods.userLiquidityTotalAmount(currentAccount, liquidityAddress).call(),
  balanceOf: string; // lpTokenContract.methods.balanceOf(currentAccount).call(),
  allowance: string; // we asume that is a map of approves from user of lpToken to element

  constructor(data: any) {
    this.address = data.address;
    this.userIdleAmount = data.userIdleAmount;
    this.userTotalAmount = data.userTotalAmount;
    this.balanceOf = data.balanceOf;
    this.allowance = data.allowance;
  }
}

// TODO: Try to reuse LiquidityData class.
export class Liquidity {
  address: string;
  symbol: string;
  protocol: string;

  constructor(data: any) {
    this.address = data.address;
    this.symbol = data.symbol;
    this.protocol = data.protocol;
  }
}

// TODO. To use on selector
// export class Liquidity implements UserLiquidityData, LiquidityData {
//   potentialUserCredits: string;

//   constructor(data: any) {
//     // super(data);
//     this.potentialUserCredits = data.potentialUserCredits;
//   }
// }
