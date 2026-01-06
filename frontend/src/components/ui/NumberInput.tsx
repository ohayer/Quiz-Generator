import React from 'react';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    min,
    max,
    className = "",
    placeholder,
    disabled = false
}) => {
    const handleDecrement = () => {
        if (disabled) return;
        if (min !== undefined && value <= min) return;
        onChange(Math.max(min ?? -Infinity, value - 1));
    };

    const handleIncrement = () => {
        if (disabled) return;
        if (max !== undefined && value >= max) return;
        onChange(Math.min(max ?? Infinity, value + 1));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const val = parseInt(e.target.value);
        if (isNaN(val)) return;

        let newValue = val;
        if (max !== undefined && newValue > max) newValue = max;
        if (min !== undefined && newValue < min) newValue = min;

        onChange(newValue);
    };

    return (
        <div className={`flex items-center ${className}`}>
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || (min !== undefined && value <= min)}
                className={`
                    w-8 h-8 flex items-center justify-center rounded-l-lg border border-r-0 border-slate-700 bg-slate-900 
                    text-slate-400 transition-colors
                    ${(disabled || (min !== undefined && value <= min))
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-slate-800 hover:text-white cursor-pointer'}
                `}
            >
                -
            </button>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                disabled={disabled}
                placeholder={placeholder}
                className={`
                    w-full h-8 bg-slate-950 border-y border-slate-700 text-center text-white text-sm no-spinner focus:outline-none
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            />
            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || (max !== undefined && value >= max)}
                className={`
                    w-8 h-8 flex items-center justify-center rounded-r-lg border border-l-0 border-slate-700 bg-slate-900 
                    text-slate-400 transition-colors
                    ${(disabled || (max !== undefined && value >= max))
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-slate-800 hover:text-white cursor-pointer'}
                `}
            >
                +
            </button>
        </div>
    );
};
