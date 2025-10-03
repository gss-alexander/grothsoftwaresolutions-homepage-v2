import { getElementStrict } from "../lib";

const CONSENT_LOCAL_STORAGE_KEY: string = "gss_cookie_consent";

export function withdrawConsent(): void {
    console.log('Tracking consent withdrawn');
    localStorage.removeItem(CONSENT_LOCAL_STORAGE_KEY);

    const cookieConsentPanel: HTMLElement = getElementStrict('cookie-consent');
    cookieConsentPanel.classList.remove('hidden');
}

export function userHasConsented(): boolean {
    return localStorage.getItem(CONSENT_LOCAL_STORAGE_KEY) === 'accepted';
}

export function userHasMadeConsentChoice(): boolean {
    return localStorage.getItem(CONSENT_LOCAL_STORAGE_KEY) !== null;
}

export function setUserConsent(hasConsent: boolean): void {
    const keyValue = hasConsent ? 'accepted' : 'declined';
    localStorage.setItem(CONSENT_LOCAL_STORAGE_KEY, keyValue);
    console.log(`User ${keyValue} consent for tracking`);
}
