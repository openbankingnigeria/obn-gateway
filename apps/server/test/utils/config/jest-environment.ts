import { TestEnvironment } from 'jest-environment-node';
import { TextEncoder, TextDecoder } from 'util';
import { matchers } from '../matchers';
import expect from 'expect';

class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    expect.extend(matchers);
    this.global.expect = expect;
  }

  async teardown() {
    await super.teardown();
  }
}

export default CustomTestEnvironment;
