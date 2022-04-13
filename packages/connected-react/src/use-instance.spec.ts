/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { Newable } from './types';
import useInstance from './use-instance';
import ConnectedProvider from './connected-provider';

class X {
  constructor(_a1: string) {}

  str() {
    return '42';
  }
}

class Y {
  constructor() {}

  str() {
    return '3.14';
  }
}

function Wrapper({ hookFn }: { hookFn: Function }) {
  const data = hookFn();
  return React.createElement(React.Fragment, null, data.str());
}
function CustomFactoryWrapper({ hookFn }: { hookFn: Function }) {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ..._args: any[]) => new klass() },
    React.createElement(Wrapper, { hookFn })
  );
}
describe('useInstance', () => {
  it('creates an instance of a class', () => {
    const wrapper = mount(
      React.createElement(Wrapper, { hookFn: () => useInstance(X) })
    );
    expect(wrapper.text()).toBe('42');
  });

  it('creates an instance using custom factory', () => {
    const wrapper = mount(
      React.createElement(CustomFactoryWrapper, {
        hookFn: () => useInstance(Y),
      })
    );
    expect(wrapper.text()).toBe('3.14');
  });
});
