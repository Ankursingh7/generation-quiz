import React from 'react';
import XCircleIcon from './icons/XCircleIcon';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-md" role="alert">
      <div className="flex">
        <div className="py-1">
          <XCircleIcon />
        </div>
        <div className="ml-3">
          <p className="font-bold text-base text-red-900">An error occurred</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;