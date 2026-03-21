import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMillis: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMillis);

        return () => clearTimeout(timeout);
    }, [value, delayMillis]);

    return debouncedValue;
}
