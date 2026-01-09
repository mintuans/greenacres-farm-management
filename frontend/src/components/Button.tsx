import React from 'react';

export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    disabled = false,
    type = 'button',
    fullWidth = false,
    icon,
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-[#13ec49] text-black hover:bg-[#11d440] focus:ring-[#13ec49]/50 shadow-lg shadow-[#13ec49]/20',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300',
        outline: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-300',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50',
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle}`}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
};
