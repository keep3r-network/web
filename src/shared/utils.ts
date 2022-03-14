import BigNumber from 'bignumber.js';

export function humanizeAmount(value: string, tokenDecimals: string = '18', wantedDecimals = '2'): string {
  const valueBN = new BigNumber(value);
  const decimalsDivision = new BigNumber(10).pow(Number(tokenDecimals));
  return valueBN.dividedBy(decimalsDivision).toFixed(Number(wantedDecimals));
}

export function normalizeString(input: string): string {
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript#answer-37511463
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function toHex(value: BigNumber | number): string {
  return '0x' + value.toString(16);
}
