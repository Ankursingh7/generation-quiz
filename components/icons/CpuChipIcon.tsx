import React from 'react';

const CpuChipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={['h-6 w-6', className].filter(Boolean).join(' ')}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V5m0 14v-1m6-7h1m-18 0h1m-5 5v-1m18 0v-1"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18a6 6 0 100-12 6 6 0 000 12z"
    />
  </svg>
);

export default CpuChipIcon;
