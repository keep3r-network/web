export class TokenData {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
  allowance: string;

  constructor(data: any) {
    this.symbol = data.symbol;
    this.address = data.address;
    this.decimals = data.decimals;
    this.balance = data.balance;
    this.allowance = data.allowance;
  }
}

export class LiquidityData {
  address: string;
  tokens: [TokenData, TokenData];
  symbol: string;
  protocol: string;
  totalSupply: string;
  token0IsKp3r: boolean;

  constructor(data: any) {
    this.address = data.address;
    this.tokens = data.tokens;
    this.symbol = data.symbol;
    this.protocol = data.protocol;
    this.totalSupply = data.totalSupply;
    this.token0IsKp3r = data.token0IsKp3r;
  }
}

export class JobLiquidityData {
  address: string;
  liquidityAmount: string;

  constructor(data: any) {
    this.address = data.address;
    this.liquidityAmount = data.liquidityAmount;
  }
}

export class UserLiquidityData {
  address: string; // liquidity address
  balanceOf: string; // lpTokenContract.methods.balanceOf(currentAccount).call(),
  allowance: string; // we asume that is a map of approves from user of lpToken to element

  constructor(data: any) {
    this.address = data.address;
    this.balanceOf = data.balanceOf;
    this.allowance = data.allowance;
  }
}

export class Liquidity {
  address: string;
  symbol: string;
  protocol: string;
  token0IsKp3r: boolean;
  tokens: [TokenData, TokenData];

  constructor(data: any) {
    this.address = data.address;
    this.symbol = data.symbol;
    this.protocol = data.protocol;
    this.token0IsKp3r = data.token0IsKp3r;
    this.tokens = data.tokens;
  }
}
