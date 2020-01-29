/// <reference types="jest" />

declare namespace jest {
  type ChainedMatchers<R> = { [K in keyof jest.Matchers<R>]: jest.Matchers<ChainedMatchers<R>>[K] };

  interface Expect {
    /**
     * The `expect` function is used every time you want to test a value.
     * You will rarely call `expect` by itself.
     *
     * @param actual The value to apply matchers against.
     */
    <T = any>(actual: T): ChainedMatchers<T>;
  }
}
