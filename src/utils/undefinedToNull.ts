export function undefinedToNull<T>(value: T | null | undefined): T | null {
    if (typeof value === "undefined") {
        return null;
    }

    return value;
}
