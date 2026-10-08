import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="btn-icon-left">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="btn-icon-right">{icon}</span>}
    </button>
  );
}
