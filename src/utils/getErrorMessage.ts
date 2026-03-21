export function getErrorMessage(error: Error): string {
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
