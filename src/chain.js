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
  const expectProxy = (...args) => chainMatchers(expect(...args)); // partially apply expect to get all matchers and chain them
  return Object.assign(expectProxy, expect); // clone additional properties on expect
};
