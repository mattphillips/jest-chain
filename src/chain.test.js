import chain from './chain';

const noop = () => {};

describe('.chain', () => {
  it('returns function with identical properties to given expect object', () => {
    const expectMock = jest.fn();
    expectMock.a = 'a';
    expectMock.fn = () => {};
    expectMock.obj = { foo: 'bar' };

    const actual = chain(expectMock);

    expect(actual.a).toBe(expectMock.a);
    expect(actual.fn).toBe(expectMock.fn);
    expect(actual.obj).toBe(expectMock.obj);
  });

  it('calls given expect when returned expect proxy is invoked', () => {
    const expectMock = jest.fn(() => ({}));

    chain(expectMock)('hello');

    expect(expectMock).toHaveBeenCalledTimes(1);
    expect(expectMock).toHaveBeenCalledWith('hello');
  });

  it('returns an object with identical keys as given expect when proxy expect is invoked', () => {
    const expectMock = jest.fn(() => ({
      toBe: noop,
      toEqual: noop
    }));

    const actual = chain(expectMock)('hello');

    expect(actual).toContainAllKeys(['toBe', 'toEqual']);
  });

  it('returns an object with identical nested keys as given expect when proxy expect is invoked', () => {
    const expectMock = jest.fn(() => ({
      toBe: noop,
      toEqual: noop,
      not: {
        toBe: noop,
        toEqual: noop
      }
    }));

    const actual = chain(expectMock)('hello');

    expect(actual.not).toContainAllKeys(['toBe', 'toEqual']);
  });

  it('calls original matcher when invoked', () => {
    const matcherMock = jest.fn();
    const expectMock = jest.fn(() => ({
      toBe: matcherMock
    }));

    chain(expectMock)('hello').toBe('world');

    expect(matcherMock).toHaveBeenCalledTimes(1);
    expect(matcherMock).toHaveBeenCalledWith('world');
  });

  it('returns matchers when matcher is invoked', () => {
    const expectMock = jest.fn(() => ({
      toBe: noop,
      toEqual: noop
    }));

    const actual = chain(expectMock)('hello').toBe('world');

    expect(actual).toContainAllKeys(['toBe', 'toEqual']);
  });

  it('calls original matcher functions when matchers are chained', () => {
    const toBe = jest.fn();
    const toEqual = jest.fn();
    const expectMock = jest.fn(() => ({
      toBe,
      toEqual
    }));

    chain(expectMock)('hello')
      .toBe('foo')
      .toEqual('bar')
      .toBe('baz');

    expect(toBe).toHaveBeenCalledTimes(2);
    expect(toBe).toHaveBeenCalledWith('foo');
    expect(toBe).toHaveBeenCalledWith('baz');
    expect(toEqual).toHaveBeenCalledTimes(1);
    expect(toEqual).toHaveBeenCalledWith('bar');
  });

  it('calls original nested matcher when invoked', () => {
    const matcherMock = jest.fn();
    const expectMock = jest.fn(() => ({
      toBe: noop,
      not: {
        toBe: matcherMock
      }
    }));

    chain(expectMock)('hello').not.toBe('world');

    expect(matcherMock).toHaveBeenCalledTimes(1);
    expect(matcherMock).toHaveBeenCalledWith('world');
  });

  it('returns matchers when nested matcher is invoked', () => {
    const expectMock = jest.fn(() => ({
      toBe: noop,
      not: {
        toBe: noop
      }
    }));

    const actual = chain(expectMock)('hello').not.toBe('world');

    expect(actual).toContainAllKeys(['toBe', 'not']);
    expect(actual.not).toContainAllKeys(['toBe']);
  });

  it('calls original matcher functions when nested matchers are chained', () => {
    const toBe = jest.fn();
    const toEqual = jest.fn();
    const notToBe = jest.fn();
    const notToEqual = jest.fn();
    const expectMock = jest.fn(() => ({
      toBe,
      toEqual,
      not: {
        toBe: notToBe,
        toEqual: notToEqual
      }
    }));

    chain(expectMock)('hello')
      .not.toBe('not foo')
      .toBe('foo')
      .not.toEqual('not bar')
      .toEqual('bar')
      .toBe('baz')
      .not.toBe('not baz');

    expect(toBe).toHaveBeenCalledTimes(2);
    expect(toBe).toHaveBeenCalledWith('foo');
    expect(toBe).toHaveBeenCalledWith('baz');
    expect(toEqual).toHaveBeenCalledTimes(1);
    expect(toEqual).toHaveBeenCalledWith('bar');

    expect(notToBe).toHaveBeenCalledTimes(2);
    expect(notToBe).toHaveBeenCalledWith('not foo');
    expect(notToBe).toHaveBeenCalledWith('not baz');
    expect(notToEqual).toHaveBeenCalledTimes(1);
    expect(notToEqual).toHaveBeenCalledWith('not bar');
  });

  it('calls original expect.extend when custom matcher is registered', () => {
    const extendMock = jest.fn();
    const expectMock = jest.fn();
    expectMock.extend = extendMock;
    const newMatcher = { newMatcher: 'woo' };

    chain(expectMock).extend(newMatcher);

    expect(extendMock).toHaveBeenCalledTimes(1);
    expect(extendMock).toHaveBeenCalledWith(newMatcher);
  });

  it('sets new asymmetric matchers when custom matcher is registered with expect.extend', () => {
    const expectMock = () => {};
    const extendMock = jest.fn(o => Object.assign(expectMock, o));
    expectMock.a = 'a';
    expectMock.extend = extendMock;
    const newMatcher = { newMatcher: 'woo' };

    const actual = chain(expectMock);

    expect(actual).toContainAllKeys(['a', 'extend']);

    actual.extend(newMatcher);

    expect(extendMock).toHaveBeenCalledTimes(1);
    expect(extendMock).toHaveBeenCalledWith(newMatcher);
    expect(actual).toContainAllKeys(['a', 'extend', 'newMatcher']);
  });

  it('throws error when matcher fails', () => {
    expect.assertions(1);
    const expectMock = jest.fn(() => ({
      toBe: () => {
        const error = new Error('');
        error.matcherResult = { message: 'blah', pass: false };
        throw error;
      }
    }));

    expect(() => chain(expectMock)('hello').toBe('hi')).toThrowErrorMatchingInlineSnapshot('"blah"');
  });
});
