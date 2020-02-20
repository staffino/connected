import React from 'react';
import { mount } from 'enzyme';
import { Newable } from './types';
import useInstance from './use-instance';
import ConnectedProvider from './connected-provider';

class X {
  constructor(a1: string) {
  }

  toString() {
    return '42';
  }
}

class Y {
  constructor() {
  }

  toString() {
    return '3.14';
  }
}

const Wrapper = ({ hookFn }: { hookFn: Function }) => {
  const data = hookFn();
  return React.createElement(React.Fragment, null, data.toString());
};
const CustomFactoryWrapper = ({ hookFn }: { hookFn: Function}) => {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ...args: any[]) => new Y() as T },
    React.createElement(Wrapper, { hookFn }),
  );
};
describe('useInstance', () => {
  it('creates an instance of a class', () => {
    const wrapper = mount(React.createElement(Wrapper, { hookFn: () => useInstance(X) }));
    expect(wrapper.text()).toBe('42');
  });

  it('creates an instance using custom factory', () => {
    const wrapper = mount(React.createElement(
      CustomFactoryWrapper, { hookFn: () => useInstance(X) }));
    expect(wrapper.text()).toBe('3.14');
  });
});
