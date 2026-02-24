const DIGITS = [1, 3, 5, 7, 9] as const;
const SPLIT_POINTS = [1, 2] as const;

type Digit = (typeof DIGITS)[number];

type NumberPair = {
  first: number;
  second: number;
  product: number;
};

const run = (): void => {
  const { first, second, product } = findMaxProductPair(DIGITS);
  console.log(`result: ${first}, ${second}`);
  console.log(`maxProduct: ${product}`);
};

const findMaxProductPair = (digits: readonly Digit[]): NumberPair => {
  const candidates = generatePermutations(digits).flatMap(toSplitCandidates);
  const best = candidates.reduce((prev, curr) => (curr.product > prev.product ? curr : prev));
  return best;
};

const toSplitCandidates = (perm: Digit[]): NumberPair[] =>
  [...SPLIT_POINTS].map((splitAt) => {
    const first = Number(perm.slice(0, splitAt).join(""));
    const second = Number(perm.slice(splitAt).join(""));
    const product = first * second;
    return { first, second, product };
  });

const generatePermutations = (nums: readonly Digit[]): Digit[][] => {
  if (nums.length <= 1) return [[...nums]];
  const perms = nums.flatMap((digit, i) => {
    const rest = nums.filter((_, j) => j !== i);
    const subPerms = generatePermutations(rest);
    return subPerms.map((perm) => [digit, ...perm]);
  });
  return perms;
};

run();
