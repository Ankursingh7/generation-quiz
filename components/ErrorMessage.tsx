import React from 'react';
import XCircleIcon from './icons/XCircleIcon';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-900/40 border-l-4 border-red-500 text-red-200 p-4 rounded-lg shadow-lg" role="alert">
      <div className="flex">
        <div className="py-1">
          <XCircleIcon />
        </div>
        <div className="ml-3">
          <p className="font-bold text-base text-red-100">An error occurred</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;