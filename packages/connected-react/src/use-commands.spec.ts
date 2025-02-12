/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { assert, IsExact } from 'conditional-type-checks';
import { Newable } from './types';
import ConnectedProvider from './connected-provider';
import useCommands from './use-commands';

class X {
  p1: string;

  // eslint-disable-next-line no-useless-constructor
  constructor(private a1: string) {}

  str() {
    return this.a1 ?? '42';
  }
}

/* Static types check */

// str() return type is string
const useCommands0 = () => useCommands(X, '3.14').str()();
assert<IsExact<ReturnType<typeof useCommands0>, string>>(true);

// str() return type is string even withou constructor parameters
const useCommands1 = () => useCommands(X).str()();
assert<IsExact<ReturnType<typeof useCommands1>, string>>(true);

function Wrapper({ hookFn }: { hookFn: Function }) {
  const data = hookFn();
  const command = data.str();
  return React.createElement(React.Fragment, null, command());
}
function CustomFactoryWrapper({ hookFn }: { hookFn: Function }) {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ..._args: any[]) => new klass('pi') },
    React.createElement(Wrapper, { hookFn })
  );
}
describe('useCommands', () => {
  it('creates a command object', () => {
    render(
      React.createElement(Wrapper, { hookFn: () => useCommands(X, '3.14') })
    );
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('creates a command object using factory', () => {
    render(
      React.createElement(CustomFactoryWrapper, {
        hookFn: () => useCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('pi')).toBeInTheDocument();
  });
});
