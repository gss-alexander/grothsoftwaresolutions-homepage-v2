// == Initialization == //
document.addEventListener('DOMContentLoaded', () => {
    initScrollTracking();
    initTimeTracking();
    trackPageView();
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

// == UTILITY == //

function generateSessionId(): string {
    return crypto.randomUUID();
}

// == Event Queue == //
const eventQueue: AnalyticsEvent[] = [];

function queueEvent<T extends Record<string, any>>(eventType: string, data?: T) {
    const event: AnalyticsEvent = {
        sessionId: generateSessionId(),
        timestamp: Date.now(),
        eventType,
        page: window.location.pathname,
        data
    };

    eventQueue.push(event);
    console.log(`Queued event: ${JSON.stringify(event)}`);
}

// == Scroll Tracking == //
let currentMaxScrollDepth: number = 0;
const scrollMilestonePercentages: number[] = [25, 50, 75, 100];
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