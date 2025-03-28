import React from 'react';
import type { ErrorHandlerFunction } from './types.js';

type ErrorHandlerContextType = {
  onError: ErrorHandlerFunction;
};

const ErrorHandlerContext = React.createContext<ErrorHandlerContextType>({
  onError: (error) => {
    throw error;
  },
});
export default ErrorHandlerContext;
