import React from 'react';
import { ErrorHandlerFunction } from './types';

type ErrorHandlerContextType = {
  onError: ErrorHandlerFunction;
};

const ErrorHandlerContext = React.createContext<ErrorHandlerContextType>({
  onError: (error) => {
    throw error;
  },
});
export default ErrorHandlerContext;
