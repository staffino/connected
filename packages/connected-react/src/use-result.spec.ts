/**
 * @jest-environment jsdom
 */

import { afterEach, describe, expect, it } from 'vitest';
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { type IsExact, assert } from 'conditional-type-checks';
import useResult from './use-result.js';
import { useCommands } from './index.js';
import type {
  Command,
  FunctionKeys,
  Newable,
  SafeParameters,
} from './types.js';
import ErrorHandler from './error-handler.js';

function f0() {
  return 'f0';
}
function f1(_a1: string) {
  return 1;
}
function f2(_a1: string, _a2: number) {
  return 'f2';
}
function f3(_a1: string, _a2: number, _a3: string) {
  return 'f3';
}
function f4(_a1: string, _a2: number, _a3: string, _a4: number) {
  return 'f4';
}
function f5(_a1: string, _a2: number, _a3: string, _a4: number, _a5: string) {
  return 'f5';
}
async function asyncFunction() {
  return 1;
}
class Provider {
  m0() {
    return 'm0';
  }

  m1(_a1: string) {
    return 1;
  }

  m2(_a1: string, _a2: number) {
    return 'm2';
  }

  m3(_a1: string, _a2: number, _a3: string) {
    return 'm3';
  }

  m4(_a1: string, _a2: number, _a3: string, _a4: number) {
    return 'm4';
  }

  m5(_a1: string, _a2: number, _a3: string, _a4: number, _a5: string) {
    return 'm5';
  }

  async asyncMethod() {
    return 1;
  }

  throwingError(): string {
    throw new Error('E1');
  }

  throwingAsyncError(): Promise<string> {
    return Promise.reject(new Error('EA1'));
  }
}

const provider = new Provider();

function buildCommand<T extends object, M extends FunctionKeys<T>>(
  instance: T,
  method: M,
  ...args: SafeParameters<T[M]>
): Command<M, Newable<T>, T> {
  const fn = () =>
    (instance[method] as unknown as Function).bind(instance)(...args);
  fn.parameters = args;
  fn.constructorParameters = [0];
  return fn;
}

/* ========== Static type tests start ========== */
const useResultF0 = () => useResult(f0);
assert<IsExact<ReturnType<typeof useResultF0>, string>>(true);

const useResultAsyncFunction = () => useResult(asyncFunction);
assert<IsExact<ReturnType<typeof useResultAsyncFunction>, number>>(true);

const useResultM0 = () => useResult(useCommands(Provider).m0());
assert<IsExact<ReturnType<typeof useResultM0>, string>>(true);

const useResultAsyncMethod = () =>
  useResult(useCommands(Provider).asyncMethod());
assert<IsExact<ReturnType<typeof useResultAsyncMethod>, number>>(true);
/* =========== Static type tests end =========== */

function Wrapper({ hookFn }: { hookFn: () => any }) {
  const data = hookFn();
  return React.createElement(React.Fragment, null, data.toString());
}

afterEach(() => {
  cleanup();
});

describe('useResult', () => {
  it('uses function with 0 parameters', () => {
    render(React.createElement(Wrapper, { hookFn: () => useResult(f0) }));
    expect(screen.getByText('f0')).toBeInTheDocument();
  });
  it('uses function with 1 parameters', () => {
    render(React.createElement(Wrapper, { hookFn: () => useResult(f1, 'a1') }));
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  it('uses function with 2 parameters', () => {
    render(
      React.createElement(Wrapper, { hookFn: () => useResult(f2, 'a1', 2) })
    );
    expect(screen.getByText('f2')).toBeInTheDocument();
  });
  it('uses function with 3 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(f3, 'a1', 2, 'a3'),
      })
    );
    expect(screen.getByText('f3')).toBeInTheDocument();
  });
  it('uses function with 4 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(f4, 'a1', 2, 'a3', 4),
      })
    );
    expect(screen.getByText('f4')).toBeInTheDocument();
  });
  it('uses function with 5 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(f5, 'a1', 2, 'a3', 4, 'a5'),
      })
    );
    expect(screen.getByText('f5')).toBeInTheDocument();
  });
  it('uses command with 0 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(buildCommand(provider, 'm0')),
      })
    );
    expect(screen.getByText('m0')).toBeInTheDocument();
  });
  it('uses request with 1 parameter', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(buildCommand(provider, 'm1', 'a1')),
      })
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  it('uses request with 2 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(buildCommand(provider, 'm2', 'a1', 2)),
      })
    );
    expect(screen.getByText('m2')).toBeInTheDocument();
  });
  it('uses request with 3 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(buildCommand(provider, 'm3', 'a1', 2, 'a3')),
      })
    );
    expect(screen.getByText('m3')).toBeInTheDocument();
  });
  it('uses request with 4 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () => useResult(buildCommand(provider, 'm4', 'a1', 2, 'a3', 4)),
      })
    );
    expect(screen.getByText('m4')).toBeInTheDocument();
  });
  it('uses request with 5 parameters', () => {
    render(
      React.createElement(Wrapper, {
        hookFn: () =>
          useResult(buildCommand(provider, 'm5', 'a1', 2, 'a3', 4, 'a5')),
      })
    );
    expect(screen.getByText('m5')).toBeInTheDocument();
  });
  it('throws error', () => {
    expect(() => {
      render(
        React.createElement(Wrapper, {
          hookFn: () => useResult(provider.throwingError),
        })
      );
    }).toThrow('E1');
  });
  it('handles error', () => {
    const handleError = (_error: Error, _data: unknown) => {
      return 'HandledE1';
    };

    render(
      React.createElement(
        ErrorHandler,
        { onError: handleError },
        React.createElement(Wrapper, {
          hookFn: () => useResult(provider.throwingError),
        })
      )
    );
    expect(screen.getByText('HandledE1')).toBeInTheDocument();
  });
});
