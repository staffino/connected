import React from 'react';
import type { ErrorHandlerFunction } from './types.js';
import ErrorHandlerContext from './error-handler-context.js';

type Props = {
  onError: ErrorHandlerFunction;
  children?: React.ReactNode | React.ReactNodeArray;
};
export default function ErrorHandler({ onError, children }: Props) {
  return React.createElement(
    ErrorHandlerContext.Provider,
    { value: { onError } },
    children
  );
}
