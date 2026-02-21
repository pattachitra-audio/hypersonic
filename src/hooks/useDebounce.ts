import { useRef } from "react";

type Fn = () => void;

export function useDebounce(callbackFn: Fn, delayMillis: number) {
    const timeoutRef = useRef(null);
}
