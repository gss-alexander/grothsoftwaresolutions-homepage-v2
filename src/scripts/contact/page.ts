import {debounce, isValidEmail} from "../lib";

const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;

// == TYPES ==
type FeedbackType = 'success' | 'error' | 'warning';

interface FormElements {
    name: HTMLInputElement | null;
    company: HTMLInputElement | null;
    email: HTMLInputElement | null;
    topic: HTMLSelectElement | null;
    message: HTMLTextAreaElement | null;
    submitButton: HTMLButtonElement | null;
    feedback: HTMLElement | null;
    feedbackMessage: HTMLElement | null;
}

interface FormData {
    name: string;
    company?: string;
    email: string;
    topic: string;
    message: string;
}

const elements: FormElements = {
    name: document.getElementById('name') as HTMLInputElement | null,
    company: document.getElementById('company') as HTMLInputElement | null,
    email: document.getElementById('email') as HTMLInputElement | null,
    topic: document.getElementById('topic') as HTMLSelectElement | null,
    message: document.getElementById('message') as HTMLTextAreaElement | null,
    submitButton: document.getElementById('submit-button') as HTMLButtonElement | null,
    feedback: document.getElementById('form-feedback'),
    feedbackMessage: document.getElementById('feedback-message')
};

function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

// == FORM VALIDATION ==

function validateName(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH;
}

function validateEmail(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.length > 0 && isValidEmail(trimmed);
}

function validateTopic(value: string): boolean {
    return value !== "";
}

function validateMessage(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH;
}

function validateFormInputs(): boolean {
    if (!elements.name || !validateName(elements.name.value)) {
        return false;
    }

    if (!elements.email || !validateEmail(elements.email.value)) {
        return false;
    }

    if (!elements.topic || !validateTopic(elements.topic.value)) {
        return false;
    }

    if (!elements.message || !validateMessage(elements.message.value)) {
        return false;
    }

    return true;
}

// == UI FUNCTIONS ==

function updateSubmitButtonState(): void {
    if (!elements.submitButton) return;
    elements.submitButton.disabled = !validateFormInputs();
}

function highlightInvalidFields(): void {
    if (!elements.name || !validateName(elements.name.value)) {
        elements.name?.classList.add('highlight-required');
    }

    if (!elements.email || !validateEmail(elements.email.value)) {
        elements.email?.classList.add('highlight-required');
    }

    if (!elements.topic || !validateTopic(elements.topic.value)) {
        elements.topic?.classList.add('highlight-required');
    }

    if (!elements.message || !validateMessage(elements.message.value)) {
        elements.message?.classList.add('highlight-required');
    }
}

function removeHighlights(): void {
    elements.name?.classList.remove('highlight-required');
    elements.email?.classList.remove('highlight-required');
    elements.topic?.classList.remove('highlight-required');
    elements.message?.classList.remove('highlight-required');
}

function showFeedback(type: FeedbackType, message: string): void {
    if (!elements.feedback || !elements.feedbackMessage) return;

    elements.feedback.classList.remove('success', 'error', 'warning', 'hidden', 'visible');
    elements.feedbackMessage.textContent = message;
    elements.feedback.classList.add(type);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            elements.feedback?.classList.add('visible');
        });
    });
}

function hideFeedback(): void {
    if (!elements.feedback) return;
    elements.feedback.classList.remove('visible');
    elements.feedback.classList.add('hidden');
}

function resetForm(): void {
    if (elements.name) elements.name.value = '';
    if (elements.company) elements.company.value = '';
    if (elements.email) elements.email.value = '';
    if (elements.topic) elements.topic.value = '';
    if (elements.message) elements.message.value = '';
    updateSubmitButtonState();
}

function setLoadingState(isLoading: boolean): void {
    if (!elements.submitButton) return;

    elements.submitButton.disabled = isLoading;
    if (isLoading) {
        elements.submitButton.classList.add('loading');
    } else {
        elements.submitButton.classList.remove('loading');
    }
}

// == EVENT HANDLERS ==
function handleButtonHover(): void {
    if (!elements.submitButton?.disabled) return;
    highlightInvalidFields();
}

function handleButtonLeave(): void {
    removeHighlights();
}

const handleInputChange = debounce((): void => {
    updateSubmitButtonState();
}, 300);


// == FORM SUBMISSION ==
function getFormData(): FormData {
    return {
        name: sanitizeInput(elements.name?.value || ''),
        company: elements.company?.value.trim() || undefined,
        email: sanitizeInput(elements.email?.value || ''),
        topic: elements.topic?.value || '',
        message: sanitizeInput(elements.message?.value || '')
    };
}

async function submitForm(): Promise<void> {
    if (!validateFormInputs()) return;

    setLoadingState(true);
    hideFeedback();

    try {
        // @ts-ignore
        const url: string = import.meta.env.VITE_CONTACT_URL;

        if (!url) {
            throw new Error('Contact URL not configured');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(getFormData()),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        switch (response.status) {
            case 200:
                showFeedback('success', 'Takk for henvendelsen! Jeg tar kontakt så snart jeg kan.');
                resetForm();
                break;
            case 400:
                showFeedback('warning', 'Noe gikk galt med informasjonen du sendte. Sjekk feltene og prøv igjen.');
                break;
            case 429:
                showFeedback('warning', 'For mange forespørsler. Vennligst vent litt før du prøver igjen.');
                break;
            case 500:
                showFeedback('error', 'Serverfeil. Prøv igjen senere eller send e-post direkte.');
                break;
            default:
                showFeedback('error', 'Noe gikk galt. Prøv igjen eller kontakt meg direkte på e-post.');
        }
    } catch (error) {
        console.error('Form submission error:', error);

        if (error instanceof Error && error.name === 'AbortError') {
            showFeedback('error', 'Forespørselen tok for lang tid. Sjekk internettforbindelsen din og prøv igjen.');
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
            showFeedback('error', 'Kunne ikke koble til serveren. Sjekk internettforbindelsen din eller send e-post direkte.');
        } else {
            showFeedback('error', 'Kunne ikke sende meldingen. Prøv igjen eller kontakt meg direkte på e-post.');
        }
    } finally {
        setLoadingState(false);
        updateSubmitButtonState();
    }
}

// == INITIALIZATION ==

function initializeForm(): void {
    if (!elements.submitButton) {
        console.error('Submit button not found');
        return;
    }

    updateSubmitButtonState();

    const inputElements = [
        elements.name,
        elements.company,
        elements.email,
        elements.topic,
        elements.message
    ].filter((el): el is NonNullable<typeof el> => el !== null);

    inputElements.forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', handleInputChange);
    });

    elements.submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await submitForm();
    });

    elements.submitButton.addEventListener('mouseenter', handleButtonHover);
    elements.submitButton.addEventListener('mouseleave', handleButtonLeave);
}

document.addEventListener('DOMContentLoaded', initializeForm);