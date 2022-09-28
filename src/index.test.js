import "./index";

describe("jest-chain", () => {
  it("chains top level matchers", () => {
    expect(1).toBe(1).toBeGreaterThan(0).toBeLessThan(2);
  });

  it("chains nested level matchers", () => {
    expect(1).toBe(1).not.toBe(0).toBeGreaterThan(0).not.toBeGreaterThan(1).toBeLessThan(2).not.toBeLessThan(1);
  });

  it("chains custom matchers from jest-extended", () => {
    expect(1).toBe(1).toBeGreaterThan(0).toBeLessThan(2).toBePositive().not.toBeNegative();
  });

  describe("fails fast", () => {
    it("throws error from first matcher: toBe when 1 != 2", () => {
      expect(() => expect(1).toBe(2).toBeGreaterThan(1).toBeLessThan(1)).toThrowErrorMatchingSnapshot();
    });

    it("throws error from second matcher: toBeGreaterThan when 1 !> 1", () => {
      expect(() => expect(1).toBe(1).toBeGreaterThan(1).toBeLessThan(1)).toThrowErrorMatchingSnapshot();
    });

    it("throws error from second matcher: toBeLessThan when 1 !< 1", () => {
      expect(() => expect(1).toBe(1).toBeGreaterThan(0).toBeLessThan(1)).toThrowErrorMatchingSnapshot();
    });
  });

  describe("supports custom matchers registered after jest-chain", () => {
    expect.extend({
      toBeDivisibleBy(received, argument) {
        const pass = received % argument == 0;
        const message = pass
          ? () => `expected ${received} not to be divisible by ${argument}`
          : () => `expected ${received} to be divisible by ${argument}`;
        return { message, pass };
      },
    });

    it("chains new custom matchers with existing ones", () => {
      expect(100).toBeDivisibleBy(2);
      expect(101).not.toBeDivisibleBy(2);
      expect(100).toBeDivisibleBy(2).toBePositive().not.toBeNegative().toBe(100);
    });

    it("supports custom asymmetric matchers", () => {
      expect({ apples: 6, bananas: 3 }).toEqual({
        apples: expect.toBeDivisibleBy(2),
        bananas: expect.not.toBeDivisibleBy(2),
      });
    });
  });

  // I don't think this is something that needs solving in this library
  it.skip("can be used as the direct return value for a test function", () =>
    expect(3).toBeGreaterThan(1).toBeLessThan(5));

  describe("Supports promises", () => {
    it("can be used with resolves", () =>
      expect(Promise.resolve(7)).resolves.toBeLessThan(10).resolves.not.toBeLessThan(5));

    it("can be used with rejects", () =>
      expect(Promise.reject(7)).rejects.toBeLessThan(10).rejects.not.toBeLessThan(5));

    it("can be used with async/await", async () => {
      expect.assertions(2);
      expect(await Promise.resolve("lemon"))
        .toBe("lemon")
        .not.toBe("banana");
    });

    it("can be used with async/await with throwing promise", async () => {
      expect.assertions(2);
      await expect(Promise.reject("lemon")).rejects.toBe("lemon").not.toBe("banana");
    });
  });
});
