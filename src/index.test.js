import './index';

describe('jest-chain', () => {
  it('chains top level matchers', () => {
    expect(1)
      .toBe(1)
      .toBeGreaterThan(0)
      .toBeLessThan(2);
  });

  it('chains nested level matchers', () => {
    expect(1)
      .toBe(1)
      .not.toBe(0)
      .toBeGreaterThan(0)
      .not.toBeGreaterThan(1)
      .toBeLessThan(2)
      .not.toBeLessThan(1);
  });

  it('chains custom matchers from jest-extended', () => {
    expect(1)
      .toBe(1)
      .toBeGreaterThan(0)
      .toBeLessThan(2)
      .toBePositive()
      .not.toBeNegative();
  });

  describe('fails fast', () => {
    it('throws error from first matcher: toBe when 1 != 2', () => {
      expect(() =>
        expect(1)
          .toBe(2)
          .toBeGreaterThan(1)
          .toBeLessThan(1)
      ).toThrowErrorMatchingSnapshot();
    });

    it('throws error from second matcher: toBeGreaterThan when 1 !> 1', () => {
      expect(() =>
        expect(1)
          .toBe(1)
          .toBeGreaterThan(1)
          .toBeLessThan(1)
      ).toThrowErrorMatchingSnapshot();
    });

    it('throws error from second matcher: toBeLessThan when 1 !< 1', () => {
      expect(() =>
        expect(1)
          .toBe(1)
          .toBeGreaterThan(0)
          .toBeLessThan(1)
      ).toThrowErrorMatchingSnapshot();
    });
  });
});
