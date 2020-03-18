import React from 'react';
import { mount } from 'enzyme';
import { Newable } from './types';
import ConnectedProvider from './connected-provider';
import useInstanceWithCommands from './use-instance-with-commands';

class X {
  p1: string;

  constructor(private a1: string) {
  }

  str() {
    return this.a1 ?? '42';
  }
}

const CommandWrapper = ({ hookFn }: { hookFn: Function }) => {
  const [, data] = hookFn();
  const command = data.str();
  const method = command.method.bind(command.instance);
  return React.createElement(React.Fragment, null, method());
};
const CommandCustomFactoryWrapper = ({ hookFn }: { hookFn: Function}) => {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ...args: any[]) => new klass('pi') },
    React.createElement(CommandWrapper, { hookFn }),
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
    React.createElement(InstanceWrapper, { hookFn }),
  );
};
describe('useInstanceWithCommands', () => {
  it('uses command object', () => {
    const wrapper = mount(React.createElement(
      CommandWrapper, { hookFn: () => useInstanceWithCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  it('uses command object with custom factory', () => {
    const wrapper = mount(React.createElement(
      CommandCustomFactoryWrapper, { hookFn: () => useInstanceWithCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('pi');
  });

  it('uses instance object', () => {
    const wrapper = mount(React.createElement(
      InstanceWrapper, { hookFn: () => useInstanceWithCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('3.14');
  });

  it('uses command object with custom factory', () => {
    const wrapper = mount(React.createElement(
      InstanceCustomFactoryWrapper, { hookFn: () => useInstanceWithCommands(X, '3.14') }));
    expect(wrapper.text()).toBe('pi');
  });
});
