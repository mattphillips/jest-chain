class JestAssertionError extends Error {
  constructor(result, callsite) {
    super(typeof result.message === "function" ? result.message() : result.message);
    this.matcherResult = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, callsite);
    }
  }
}

const chainMatchers = (matchers, originalMatchers = matchers) => {
  const mappedMatchers = Object.keys(matchers).map((name) => {
    const matcher = matchers[name];

    if (typeof matcher === "function") {
      const newMatcher = (...args) => {
        try {
          const result = matcher(...args); // run matcher
          if (result && typeof result.then === "function") {
            return Object.assign(Promise.resolve(result), chainMatchers(originalMatchers));
          } else {
            return chainMatchers(originalMatchers); // chain the original matchers again
          }
        } catch (error) {
          if (!error.matcherResult) {
            throw error;
          } else {
            throw new JestAssertionError(error.matcherResult, newMatcher);
          }
        }
      };
      return { [name]: newMatcher };
    }

    return {
      [name]: chainMatchers(matcher, originalMatchers), // recurse on .not/.resolves/.rejects
    };
  });

  return Object.assign({}, ...mappedMatchers);
};

export default (expect) => {
  // proxy the expect function
  let expectProxy = Object.assign(
    (...args) => chainMatchers(expect(...args)), // partially apply expect to get all matchers and chain them
    expect // clone additional properties on expect
  );

  expectProxy.extend = (o) => {
    expect.extend(o); // add new matchers to expect
    expectProxy = Object.assign(expectProxy, expect); // clone new asymmetric matchers
  };

  return expectProxy;
};
