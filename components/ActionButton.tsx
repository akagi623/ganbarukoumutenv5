import * as React from 'react';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}

const ActionButton = ({ children, onClick, className = 'bg-blue-500 hover:bg-blue-600', disabled = false, title, type = "button" }: ActionButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-full font-mochiy py-2.5 px-5 rounded-lg text-white transition-all duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 active:scale-95 ${className}`}
  >
    {children}
  </button>
);

export default ActionButton;