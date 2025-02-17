import React from 'react';
import { ErrorHandlerFunction } from './types';
import ErrorHandlerContext from './error-handler-context';

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
