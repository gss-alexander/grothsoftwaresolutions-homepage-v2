// Tries to fetch an HTML element from the DOM by element ID. Will throw an error if not found.
export function getElementStrict(elementId: string): HTMLElement {
    const element: HTMLElement | null = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Could not find element with id: ${elementId}`);
    }
    return element as HTMLElement;
}

// Parses a standard email with regex to determine if the structure is valid
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}