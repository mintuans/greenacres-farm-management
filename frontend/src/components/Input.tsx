import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    icon,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const widthStyle = fullWidth ? 'w-full' : '';
    const errorStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#13ec49]';

    return (
        <div className={`flex flex-col gap-1.5 ${widthStyle}`}>
            {label && (
                <label className="text-sm font-semibold text-slate-700">
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}

                <input
                    className={`
            w-full px-4 py-2.5 rounded-xl border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${errorStyle}
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-sm text-slate-500">{helperText}</p>
            )}
        </div>
    );
};
