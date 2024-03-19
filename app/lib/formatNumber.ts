function toFixedNonRounded(num: number, fixed: number): string {
  var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  const match = num.toString().match(re);
  return match ? match[0] : "0";
}

function convertBigNumber(bigInt: bigint) {
  let convertBigInt = bigInt / BigInt(1e18);
  return parseInt(convertBigInt.toString(), 10);
}

export function formatNumber(amount: string): string {
  let value = convertBigNumber(BigInt(amount));
  if (value >= 1_000_000_000) {
    // Billions
    return toFixedNonRounded(value / 1_000_000_000, 2) + "B";
  } else if (value >= 1_000_000) {
    // Millions
    return toFixedNonRounded(value / 1_000_000, 2) + "M";
  } else if (value >= 1_000) {
    // Thousands
    return toFixedNonRounded(value / 1_000, 2) + "K";
  } else {
    return value.toFixed(2); // Ensure two decimal places for smaller numbers
  }
}
