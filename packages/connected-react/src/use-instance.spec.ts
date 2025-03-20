/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Newable } from './types.js';
import useInstance from './use-instance.js';
import ConnectedProvider from './connected-provider.js';

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
    render(React.createElement(Wrapper, { hookFn: () => useInstance(X) }));
    expect(screen.getByText(42)).toBeInTheDocument();
  });

  it('creates an instance using custom factory', () => {
    render(
      React.createElement(CustomFactoryWrapper, {
        hookFn: () => useInstance(Y),
      })
    );
    expect(screen.getByText('3.14')).toBeInTheDocument();
  });
});
