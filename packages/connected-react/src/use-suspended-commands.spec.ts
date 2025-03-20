/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { assert, type IsExact } from 'conditional-type-checks';
import type { Newable } from './types.js';
import ConnectedProvider from './connected-provider.js';
import useSuspendedCommands from './use-suspended-commands.js';

class X {
  p1: string;

  constructor(private a1: string) {}

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
describe('useSuspendedCommands', () => {
  it('creates a command object', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useSuspendedCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('creates a command object using factory', () => {
    render(
      React.createElement(CustomFactoryWrapper, {
        hookFn: () => useSuspendedCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('pi')).toBeInTheDocument();
  });
});
