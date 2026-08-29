import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
