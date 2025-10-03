// == Initialization == //
import {setUserConsent, userHasConsented, userHasMadeConsentChoice} from "./consent.ts";
import {getElementStrict} from "../lib";

document.addEventListener('DOMContentLoaded', () => {
    initScrollTracking();
    initTimeTracking();
    trackPageView();
    initConsentButtonEvents();
});

window.addEventListener('pagehide', () => {
    cleanupAnalytics();
});

// Cleans up any analytic tracking and flush event queue
export function cleanupAnalytics() {
    window.clearInterval(scrollTrackingIntervalId);
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

// == Consent == //

function initConsentButtonEvents(): void {
    const consentBox = getElementStrict('cookie-consent');

    if (!userHasMadeConsentChoice()) {
        consentBox.classList.remove('hidden');
    }

    const acceptButton = getElementStrict('cookie-accept');
    acceptButton.addEventListener('click', () => {
        setUserConsent(true);
        processQueuedEvents();
        consentBox.classList.add('hidden');
    });

    const declineButton = getElementStrict('cookie-decline');
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
    console.debug(`Generated a new session ID with value ${newSession}`);

    return newSession;
}

// == Events == //
const MAX_EVENT_QUEUE_SIZE: number = 50; // Probably excessive. I just want to limit storage being used on client.
// @ts-ignore
const ANALYTICS_URL: string = import.meta.env.VITE_ANALYTICS_URL;
const eventQueue: AnalyticsEvent[] = [];

function sendEventToServer(event: AnalyticsEvent): void {
    if (!userHasConsented()) {
        throw new Error("Tried to post analytics event, but user has not consented");
    }

    try {
        fetch(ANALYTICS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event),
            keepalive: true
        }).catch(err => {
            console.error('Error while sending event to server:', err);
        });
        console.debug(`Sending analytics event of type ${event.eventType} to server`);
    } catch (err) {
        console.error('Error while sending event to server:', err);
    }
}

function registerEvent<T extends Record<string, any>>(eventType: string, data?: T) {
    const event: AnalyticsEvent = {
        sessionId: getSessionId(),
        timestamp: Date.now(),
        eventType,
        page: window.location.pathname,
        data
    };

    console.debug(`Registering event of type ${event.eventType}`);

    if (userHasConsented()) {
        sendEventToServer(event);
    } else {
        if (eventQueue.length > MAX_EVENT_QUEUE_SIZE) {
            eventQueue.shift();
        }

        eventQueue.push(event);
    }
}

function processQueuedEvents(): void {
    console.debug(`Processing ${eventQueue.length} queued events`);
    for (const event of eventQueue) {
        sendEventToServer(event);
    }
    eventQueue.length = 0;
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
                registerEvent<ScrollMilestoneData>('scroll_milestone', { depth: milestone });
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
    registerEvent<PageViewData>('page_view', {
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

    registerEvent<TimeOnPageData>('time_on_page', {
        duration: Math.round(totalVisibleTime),
        wasVisible: totalVisibleTime > 1000 // at least 1 second visible
    });
}