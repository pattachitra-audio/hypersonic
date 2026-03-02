import { useEffect, useState } from "react";

// type Fn = () => void;

export function useDebounce<T>(value: T, delayMillis: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    // const timeoutRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMillis);

        return () => clearTimeout(timeout);
    }, [value, delayMillis]);

    return debouncedValue;
}
