/**
 * @jest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';
import * as React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { assert, type IsExact } from 'conditional-type-checks';
import type { Newable } from './types.js';
import ConnectedProvider from './connected-provider.js';
import useInstanceWithSuspendedCommands from './use-instance-with-suspended-commands.js';

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

function CommandWrapper({
  hookFn,
  fn = 'str',
}: {
  hookFn: Function;
  fn?: string;
}) {
  const [, data] = hookFn();
  const command = data[fn]();
  return React.createElement(React.Fragment, null, command());
}
function CommandCustomFactoryWrapper({
  hookFn,
  fn = 'str',
}: {
  hookFn: Function;
  fn?: string;
}) {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ..._args: any[]) => new klass('pi') },
    React.createElement(
      React.Suspense,
      { fallback: '...' },
      React.createElement(CommandWrapper, { hookFn, fn })
    )
  );
}
function InstanceWrapper({ hookFn }: { hookFn: Function }) {
  const [data] = hookFn();
  return React.createElement(React.Fragment, null, data.str());
}
function InstanceCustomFactoryWrapper({ hookFn }: { hookFn: Function }) {
  return React.createElement(
    ConnectedProvider,
    { factory: <T>(klass: Newable<T>, ..._args: any[]) => new klass('pi') },
    React.createElement(
      React.Suspense,
      { fallback: '...' },
      React.createElement(InstanceWrapper, { hookFn })
    )
  );
}

afterEach(() => {
  cleanup();
});

describe('useInstanceWithSuspendedCommands', () => {
  it('uses command object', () => {
    render(
      React.createElement(CommandWrapper, {
        hookFn: () => useInstanceWithSuspendedCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it.skip('strips promise', async () => {
    await act(async () => {
      render(
        React.createElement(CommandCustomFactoryWrapper, {
          fn: 'promised',
          hookFn: () => useInstanceWithSuspendedCommands(X, '3.14'),
        })
      );
    });
    screen.debug();
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('uses command object with custom factory', () => {
    render(
      React.createElement(CommandCustomFactoryWrapper, {
        hookFn: () => useInstanceWithSuspendedCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('pi')).toBeInTheDocument();
  });

  it('uses instance object', () => {
    render(
      React.createElement(InstanceWrapper, {
        hookFn: () => useInstanceWithSuspendedCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });

  it('uses command object with custom factory', () => {
    render(
      React.createElement(InstanceCustomFactoryWrapper, {
        hookFn: () => useInstanceWithSuspendedCommands(X, '3.14'),
      })
    );
    expect(screen.getByText('pi')).toBeInTheDocument();
  });
});
