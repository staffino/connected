import React from 'react';
import { mount } from 'enzyme';
import { Newable } from './types';
import ConnectedProvider from './connected-provider';
import useCommands from './use-commands';

class X {
  p1: string;

  constructor(private a1: string) {
  }

  str() {
    return this.a1 ?? '42';
  }
}

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
describe('useInstance', () => {
  it('creates a command object', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  it('creates a command object using factory', () => {
    const wrapper = mount(React.createElement(
      CustomFactoryWrapper, { hookFn: () => useCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('pi');
  });
});
