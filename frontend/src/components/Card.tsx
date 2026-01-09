import React from 'react';

export interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    children,
    footer,
    className = '',
    onClick,
    hoverable = false,
}) => {
    const hoverStyles = hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm border border-slate-200 transition-all ${hoverStyles} ${className}`}
        >
            {(title || subtitle) && (
                <div className="p-6 border-b border-slate-100">
                    {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
            )}

            <div className="p-6">
                {children}
            </div>

            {footer && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                    {footer}
                </div>
            )}
        </div>
    );
};
