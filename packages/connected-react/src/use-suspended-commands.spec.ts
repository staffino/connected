/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { assert, IsExact } from 'conditional-type-checks';
import { Newable } from './types';
import ConnectedProvider from './connected-provider';
import useSuspendedCommands from './use-suspended-commands';

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

// str() return type is string
const useCommands0 = () => useSuspendedCommands(X, '3.14').str()();
assert<IsExact<ReturnType<typeof useCommands0>, string>>(true);

// str() return type is string even without constructor parameters
const useCommands1 = () => useSuspendedCommands(X).str()();
assert<IsExact<ReturnType<typeof useCommands1>, string>>(true);

// promised() return type is string (without a Promise)
const useCommands2 = () => useSuspendedCommands(X, '3.14').str()();
assert<IsExact<ReturnType<typeof useCommands2>, string>>(true);

// promised() return type is string (without a Promise) even without constructor parameters
const useCommands3 = () => useSuspendedCommands(X).str()();
assert<IsExact<ReturnType<typeof useCommands3>, string>>(true);

const Wrapper = ({ hookFn }: { hookFn: Function }) => {
  const data = hookFn();
  const command = data.str();
  return React.createElement(React.Fragment, null, command());
};
const CustomFactoryWrapper = ({ hookFn }: { hookFn: Function}) => {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ...args: any[]) => new klass('pi') },
    React.createElement(Wrapper, { hookFn }),
  );
};
describe('useSuspendedCommands', () => {
  it('creates a command object', () => {
    const wrapper = mount(
      React.createElement(Wrapper, { hookFn: () => useSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  it('creates a command object using factory', () => {
    const wrapper = mount(React.createElement(
      CustomFactoryWrapper, { hookFn: () => useSuspendedCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('pi');
  });
});
