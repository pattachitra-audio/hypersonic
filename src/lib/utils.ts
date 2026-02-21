import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function newArrWithModification<T>(arr: T[], index: number, value: T) {
    if (index < 0 || index >= arr.length) {
        return arr;
    }

    if (index === 0) {
        return [value, ...arr.slice(1)];
    } else if (index === arr.length - 1) {
        return [...arr.slice(0, -1), value];
    }

    return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}
