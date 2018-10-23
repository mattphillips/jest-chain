const chainMatchers = (matchers, originalMatchers = matchers) => {
  return Object.keys(matchers).reduce((acc, name) => {
    const matcher = matchers[name];
    if (typeof matcher === 'function') {
      return {
        ...acc,
        [name]: (...args) => {
          matcher(...args); // run matcher
          return chainMatchers(originalMatchers); // chain the original matchers again
        }
      };
    }
    return {
      ...acc,
      [name]: chainMatchers(matcher, originalMatchers) // recurse on .not/.resolves/.rejects
    };
  }, {});
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
