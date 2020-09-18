import React from 'react';
import { mount } from 'enzyme';
import { Newable } from './types';
import ConnectedProvider from './connected-provider';
import useInstanceWithSuspendedCommands from './use-instance-with-suspended-commands';
import { assert, IsExact } from 'conditional-type-checks';

class X {
  p1: string;

  constructor(private a1: string) {
  }

  str() {
    return this.a1 ?? '42';
  }
  promised(): Promise<string> {
    return Promise.resolve(this.a1 ?? '42');
  }
}

/* Static types check */

// str() command return type is string if parameters are used
const fn0 = () => useInstanceWithSuspendedCommands(X, '3.14')[1].str()();
assert<IsExact<ReturnType<typeof fn0>, string>>(true);

// str() command return type is string even if no parameters are used
const fn1 = () => useInstanceWithSuspendedCommands(X)[1].str()();
assert<IsExact<ReturnType<typeof fn1>, string>>(true);

// promised() command return type is string (not Promise)
const fn2 = () => useInstanceWithSuspendedCommands(X, '3.14')[1].promised()();
assert<IsExact<ReturnType<typeof fn2>, string>>(true);

// promised() command return type is string (not Promise) even if no parameters are used
const fn3 = () => useInstanceWithSuspendedCommands(X)[1].promised()();
assert<IsExact<ReturnType<typeof fn3>, string>>(true);


// str() instance return type is string
const fn4 = () => useInstanceWithSuspendedCommands(X, '3.14')[0].str();
assert<IsExact<ReturnType<typeof fn4>, string>>(true);

// str() instance return type is string even if no parameters are used
const fn5 = () => useInstanceWithSuspendedCommands(X)[0].str();
assert<IsExact<ReturnType<typeof fn5>, string>>(true);


const CommandWrapper = ({ hookFn, fn = 'str' }: { hookFn: Function, fn?: string }) => {
  const [, data] = hookFn();
  const command = data[fn]();
  return React.createElement(React.Fragment, null, command());
};
const CommandCustomFactoryWrapper = ({ hookFn, fn = 'str' }: { hookFn: Function, fn?: string }) => {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ...args: any[]) => new klass('pi') },
    React.createElement(
      React.Suspense,
      { fallback: '...' },
      React.createElement(CommandWrapper, { hookFn, fn })),
  );
};
const InstanceWrapper = ({ hookFn }: { hookFn: Function }) => {
  const [data] = hookFn();
  return React.createElement(React.Fragment, null, data.str());
};
const InstanceCustomFactoryWrapper = ({ hookFn }: { hookFn: Function}) => {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ...args: any[]) => new klass('pi') },
    React.createElement(
      React.Suspense,
      { fallback: '...' },
      React.createElement(InstanceWrapper, { hookFn }),
    ),
  );
};
describe('useInstanceWithSuspendedCommands', () => {
  it('uses command object', () => {
    const wrapper = mount(React.createElement(
      CommandWrapper, { hookFn: () => useInstanceWithSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  xit('strips promise', () => {
    const wrapper = mount(React.createElement(
      CommandCustomFactoryWrapper,
      { fn: 'promised', hookFn: () => useInstanceWithSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  it('uses command object with custom factory', () => {
    const wrapper = mount(React.createElement(
      CommandCustomFactoryWrapper, { hookFn: () => useInstanceWithSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('pi');
  });

  it('uses instance object', () => {
    const wrapper = mount(React.createElement(
      InstanceWrapper, { hookFn: () => useInstanceWithSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  it('uses command object with custom factory', () => {
    const wrapper = mount(React.createElement(
      InstanceCustomFactoryWrapper, { hookFn: () => useInstanceWithSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('pi');
  });
});
