// components/LoadingSpinner.jsx
import React from 'react';
// components/LoadingSpinner.jsx
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default LoadingSpinner;