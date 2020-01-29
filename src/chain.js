const chainMatchers = (matchers, originalMatchers = matchers, value = undefined) => {
  // map over matchers and then merge using Object.assign's var args capibility
  const mappedMatchers = Object.keys(matchers).map(name => {
    const matcher = matchers[name];
    if (typeof matcher === 'function') {
      const newMatcher = (...args) => {
        const v = matcher(...args); // run matcher
        return chainMatchers(originalMatchers, originalMatchers, v); // chain the original matchers again
      };
      return {
        [name]: newMatcher
      };
    }
    return {
      [name]: chainMatchers(matcher, originalMatchers) // recurse on .not/.resolves/.rejects
    };
  });

  /*
   *Hack*: Set matchers onto a promise as tests require a return type of Promise/void - the result of chaining shouldn't really be treated as a promise though

   See:
    - https://github.com/mattphillips/jest-chain/issues/8
    - https://github.com/mattphillips/jest-chain/issues/1
    - https://github.com/facebook/jest/pull/6517
  */
  const p = Promise.resolve(value && typeof value.then === 'function' ? value : undefined);
  return Object.assign(p, ...mappedMatchers);
};

export default expect => {
  // proxy the expect function
  let expectProxy = Object.assign(
    (...args) => chainMatchers(expect(...args)), // partially apply expect to get all matchers and chain them
    expect // clone additional properties on expect
  );

  expectProxy.extend = o => {
    expect.extend(o); // add new matchers to expect
    expectProxy = Object.assign(expectProxy, expect); // clone new asymmetric matchers
  };

  return expectProxy;
};
