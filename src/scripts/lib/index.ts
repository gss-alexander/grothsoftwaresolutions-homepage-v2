// Tries to fetch an HTML element from the DOM by element ID. Will throw an error if not found.
export function getElementStrict(elementId: string): HTMLElement {
    const element: HTMLElement | null = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Could not find element with id: ${elementId}`);
    }
    return element as HTMLElement;
}