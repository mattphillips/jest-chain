import sum from "../src/sum";

describe("Test math", () => {
  test("Commutative Law of Addition", () => {
    expect(sum(1, 2)).toBe(sum(2, 1)).toEqual(sum(2, 1));
  });
});
