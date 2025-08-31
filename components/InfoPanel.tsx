import * as React from 'react';

interface InfoPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoPanel = ({ title, children, className }: InfoPanelProps) => (
  <div className={`bg-white border border-gray-200 p-4 rounded-lg shadow ${className}`}>
    <h3 className="text-xl font-bold font-mochiy text-gray-700 mb-2.5">{title}</h3>
    <div className="space-y-1 text-gray-700">{children}</div>
  </div>
);

export default InfoPanel;