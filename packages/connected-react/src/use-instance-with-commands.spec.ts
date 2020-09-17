import React from 'react';
import { mount } from 'enzyme';
import { Newable } from './types';
import ConnectedProvider from './connected-provider';
import useInstanceWithCommands from './use-instance-with-commands';
import { assert, IsExact } from 'conditional-type-checks';

class X {
  p1: string;

  constructor(private a1: string) {
  }

  str() {
    return this.a1 ?? '42';
  }
}

/* Static types check */

// str() command return type is string if parameters are used
const fn0 = () => useInstanceWithCommands(X, '3.14')[1].str()();
assert<IsExact<ReturnType<typeof fn0>, string>>(true);

// str() command return type is string even if no parameters are used
const fn1 = () => useInstanceWithCommands(X)[1].str()();
assert<IsExact<ReturnType<typeof fn1>, string>>(true);


// str() instance return type is string
const fn2 = () => useInstanceWithCommands(X, '3.14')[0].str();
assert<IsExact<ReturnType<typeof fn2>, string>>(true);

// str() instance return type is string even if no parameters are used
const fn3 = () => useInstanceWithCommands(X)[0].str();
assert<IsExact<ReturnType<typeof fn3>, string>>(true);


const CommandWrapper = ({ hookFn }: { hookFn: Function }) => {
  const [, data] = hookFn();
  const command = data.str();
  return React.createElement(React.Fragment, null, command());
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
