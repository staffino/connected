/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { IsExact, assert } from 'conditional-type-checks';
import useResult from './use-result';
import { useCommands } from './index';
import { Command, FunctionKeys, Newable } from './types';

function f0() {
  return 'f0';
}
function f1(a1: string) {
  return 1;
}
function f2(a1: string, a2: number) {
  return 'f2';
}
function f3(a1: string, a2: number, a3: string) {
  return 'f3';
}
function f4(a1: string, a2: number, a3: string, a4: number) {
  return 'f4';
}
function f5(a1: string, a2: number, a3: string, a4: number, a5: string) {
  return 'f5';
}
async function asyncFunction() {
  return 1;
}
class Provider {
  m0() {
    return 'm0';
  }
  m1(a1: string) {
    return 1;
  }
  m2(a1: string, a2: number) {
    return 'm2';
  }
  m3(a1: string, a2: number, a3: string) {
    return 'm3';
  }
  m4(a1: string, a2: number, a3: string, a4: number) {
    return 'm4';
  }
  m5(a1: string, a2: number, a3: string, a4: number, a5: string) {
    return 'm5';
  }
  async asyncMethod() {
    return 1;
  }
}

const provider = new Provider();

function buildCommand<
  T extends object,
  M extends FunctionKeys<T>,
>(
  instance: T,
  method: M,
  ...args: Parameters<T[M]>
): Command<M, Newable<T>, T> {
  const fn = () => (instance[method] as Function).bind(instance)(...args);
  fn.parameters = args;
  fn.constructorParameters = [0];
  return fn;
}

/* ========== Static type tests start ========== */
const useResultF0 = () => useResult(f0);
assert<IsExact<ReturnType<typeof useResultF0>, string>>(true);

const useResultAsyncFunction = () => useResult(asyncFunction);
assert<IsExact<ReturnType<typeof useResultAsyncFunction>, number>>(true);

const useResultM0 = () => useResult(useCommands(Provider).m0());
assert<IsExact<ReturnType<typeof useResultM0>, string>>(true);

const useResultAsyncMethod = () => useResult(useCommands(Provider).asyncMethod());
assert<IsExact<ReturnType<typeof useResultAsyncMethod>, number>>(true);
/* =========== Static type tests end =========== */

const Wrapper = ({ hookFn }: { hookFn: Function}) => {
  const data = hookFn();
  return React.createElement(React.Fragment, null, data.toString());
};

describe('useResult', () => {
  it('uses function with 0 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(f0) }));
    expect(wrapper.text()).toBe('f0');
  });
  it('uses function with 1 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(f1, 'a1') }));
    expect(wrapper.text()).toBe('1');
  });
  it('uses function with 2 parameters', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useResult(f2, 'a1', 2) }));
    expect(wrapper.text()).toBe('f2');
  });
  it('uses function with 3 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f3, 'a1', 2, 'a3') }));
    expect(wrapper.text()).toBe('f3');
  });
  it('uses function with 4 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f4, 'a1', 2, 'a3', 4) }));
    expect(wrapper.text()).toBe('f4');
  });
  it('uses function with 5 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(f5, 'a1', 2, 'a3', 4, 'a5') }));
    expect(wrapper.text()).toBe('f5');
  });
  it('uses command with 0 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(buildCommand(provider, 'm0')) }));
    expect(wrapper.text()).toBe('m0');
  });
  it('uses request with 1 parameter', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(buildCommand(provider, 'm1', 'a1')) }));
    expect(wrapper.text()).toBe('1');
  });
  it('uses request with 2 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(buildCommand(provider, 'm2', 'a1', 2)) }));
    expect(wrapper.text()).toBe('m2');
  });
  it('uses request with 3 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(buildCommand(provider, 'm3', 'a1', 2, 'a3')) }));
    expect(wrapper.text()).toBe('m3');
  });
  it('uses request with 4 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(buildCommand(provider, 'm4', 'a1', 2, 'a3', 4)) }));
    expect(wrapper.text()).toBe('m4');
  });
  it('uses request with 5 parameters', () => {
    const wrapper = mount(React.createElement(
      Wrapper, { hookFn: () => useResult(buildCommand(provider, 'm5', 'a1', 2, 'a3', 4, 'a5')) }));
    expect(wrapper.text()).toBe('m5');
  });
});
