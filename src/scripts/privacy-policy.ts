import {withdrawConsent} from "./analytics/consent.ts";
import {getElementStrict} from "./lib";

const withdrawSpan = getElementStrict('cookie-consent-withdraw');
withdrawSpan.addEventListener('click', () => {
    withdrawConsent();
});
