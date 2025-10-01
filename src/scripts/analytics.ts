// == Initialization == //
document.addEventListener('DOMContentLoaded', () => {
    initScrollTracking();
    initTimeTracking();
    trackPageView();
    initConsentButtonEvents();
});

window.addEventListener('pagehide', () => {
    processEventQueue();
    cleanupAnalytics();
});

// Cleans up any analytic tracking and flush event queue
export function cleanupAnalytics() {
    window.clearInterval(scrollTrackingIntervalId);
    window.clearInterval(eventProcessingIntervalId);
}

// == Event Types == //
interface AnalyticsEvent {
    sessionId: string;
    timestamp: number;
    eventType: string;
    page: string;
    data?: Record<string, any>
}

interface ScrollMilestoneData {
    depth: number;
}

interface PageViewData {
    referrer: string;
    url: string;
}

interface TimeOnPageData {
    duration: number;
    wasVisible: boolean;
}

// == Utility == //
function getElementWithThrow(elementId: string): HTMLElement {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Could not find element with id \"${elementId}\"`);
    }
    return element;
}

// == Consent == //

const CONSENT_KEY: string = "gss_cookie_consent";

function userHasConsented(): boolean {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

function userHasMadeConsentChoice(): boolean {
    return localStorage.getItem(CONSENT_KEY) !== null;
}

function setUserConsent(hasConsent: boolean): void {
    localStorage.setItem(CONSENT_KEY, hasConsent ? 'accepted' : 'declined');
}

function initConsentButtonEvents(): void {
    if (userHasMadeConsentChoice()) {
        if (userHasConsented()) {
            initEventProcessing();
        }
        return;
    }

    const consentBox = getElementWithThrow('cookie-consent');
    consentBox.classList.remove('hidden');

    const acceptButton = getElementWithThrow('cookie-accept');
    acceptButton.addEventListener('click', () => {
        setUserConsent(true);
        initEventProcessing();
        consentBox.classList.add('hidden');
    });

    const declineButton = getElementWithThrow('cookie-decline');
    declineButton.addEventListener('click', () => {
        setUserConsent(false);
        consentBox.classList.add('hidden');
    })
}

// == Session ID == //

const SESSION_ID_KEY: string = "gss_session_id";

function generateNewSession(): string {
    return crypto.randomUUID();
}

function getSessionId(): string {
    const existingSession = sessionStorage.getItem(SESSION_ID_KEY);
    if (existingSession) {
        return existingSession;
    }

    const newSession = generateNewSession();
    sessionStorage.setItem(SESSION_ID_KEY, newSession);

    return newSession;
}

// == Event Queue == //
const MAX_EVENT_QUEUE_SIZE: number = 10;
const eventQueue: AnalyticsEvent[] = [];

function postEvent(event: AnalyticsEvent): void {
    if (!userHasConsented()) {
        throw new Error("Tried to post analytics event, but user has not consented");
    }

    fetch('http://localhost:3000/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
    }).then(_ => {
        console.log(`Posted event: ${JSON.stringify(event)}`);
    }).catch(err => {
        console.error(err);
    });
}

function queueEvent<T extends Record<string, any>>(eventType: string, data?: T) {
    const event: AnalyticsEvent = {
        sessionId: getSessionId(),
        timestamp: Date.now(),
        eventType,
        page: window.location.pathname,
        data
    };

    if (eventQueue.length > MAX_EVENT_QUEUE_SIZE) {
        eventQueue.shift();
    }

    eventQueue.push(event);
    console.log(`Queued event: ${JSON.stringify(event)}`);
}


function processEventQueue(): void {
    for (const event of eventQueue) {
        postEvent(event);
    }
    eventQueue.length = 0;
}

const EVENT_PROCESSING_INTERVAL_MS: number = 250;
let eventProcessingIntervalId: number;

function initEventProcessing(): void {
    if (!userHasConsented()) {
        throw new Error("Tried to start processing analytics event queue, but user has not consented");
    }

    eventProcessingIntervalId = window.setInterval(() => {
        processEventQueue();
    }, EVENT_PROCESSING_INTERVAL_MS);
}

// == Scroll Tracking == //
let currentMaxScrollDepth: number = 0;
const scrollMilestonePercentages: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const triggeredMilestones: Set<number> = new Set<number>();

// Calculate how far down a page the user has scrolled as a percentage between 0f and 100f
function getCurrentScrollDepth(): number {
    const scrollTop: number = window.pageYOffset;
    const documentHeight: number = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round((scrollTop / documentHeight) * 100);
}

// Fetches the current scroll depth of the user and enqueues it as an event
function trackScrollDepth() {
    const currentDepth: number = getCurrentScrollDepth();

    if (currentDepth > currentMaxScrollDepth) {
        currentMaxScrollDepth = currentDepth;

        scrollMilestonePercentages.forEach(milestone => {
            if (currentDepth >= milestone && !triggeredMilestones.has(milestone)) {
                triggeredMilestones.add(milestone);
                queueEvent<ScrollMilestoneData>('scroll_milestone', { depth: milestone });
            }
        });
    }
}

const SCROLL_TRACKING_INTERVAL_MS: number = 250;
let scrollTrackingIntervalId: number;
function initScrollTracking() {
    scrollTrackingIntervalId = window.setInterval(() => {
        trackScrollDepth();
    }, SCROLL_TRACKING_INTERVAL_MS);
}

// == PAGE VIEW TRACKING == //
function trackPageView(): void {
    queueEvent<PageViewData>('page_view', {
        referrer: document.referrer || 'direct',
        url: window.location.href
    });
}

// == TIME ON PAGE TRACKING == //
let pageStartTime: number;
let lastVisibilityChange: number;
let totalVisibleTime: number = 0;
let isPageVisible: boolean = true;

function initTimeTracking() {
    pageStartTime = performance.now();
    lastVisibilityChange = pageStartTime;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', trackTimeOnPage);
}

function handleVisibilityChange() {
    const now = performance.now();

    if (document.visibilityState === 'hidden') {
        if (isPageVisible) {
            totalVisibleTime += now - lastVisibilityChange;
            isPageVisible = false;
        }
    } else {
        isPageVisible = true;
        lastVisibilityChange = now;
    }
}

function trackTimeOnPage() {
    const now = performance.now();
    if (isPageVisible) {
        totalVisibleTime += now - lastVisibilityChange;
    }

    queueEvent<TimeOnPageData>('time_on_page', {
        duration: Math.round(totalVisibleTime),
        wasVisible: totalVisibleTime > 1000 // at least 1 second visible
    });
}