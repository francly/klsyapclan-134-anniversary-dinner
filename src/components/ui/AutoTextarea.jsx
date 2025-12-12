import { useRef, useEffect } from 'react';

export default function AutoTextarea({ value, onChange, className, placeholder, minRows = 1 }) {
    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
                onChange(e);
                adjustHeight();
            }}
            className={className}
            placeholder={placeholder}
            rows={minRows}
            style={{ overflow: 'hidden' }} // Hide scrollbar
        />
    );
}
