import * as React from 'react';

interface LoadingScreenProps {
  progress: number; // 0 to 100
}

const LoadingScreen = ({ progress }: LoadingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-mochiy text-gray-700 mb-4 animate-pulse">
          データを読み込んでいます...
        </h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden border border-gray-300 shadow-inner">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-lg font-semibold text-gray-800">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
