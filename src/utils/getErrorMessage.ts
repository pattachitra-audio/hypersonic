export function getErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
        return `Unknown error`;
    }

    const messages: string[] = [];
    let currentError: unknown = error;

    while (currentError instanceof Error) {
        let currentMessage = currentError.message.trim();

        if (currentMessage.endsWith(".")) {
            currentMessage = currentMessage.slice(0, -1);
        }

        messages.push(currentMessage);
        currentError = currentError.cause;
    }

    return messages.join("; ");
}
