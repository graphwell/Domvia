/**
 * Utility for haptic feedback on mobile devices.
 * Simulates a light tactile click.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;

    // Different vibration patterns for different feedback types
    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(20);
            break;
        case 'success':
            navigator.vibrate([10, 30, 10]);
            break;
        case 'warning':
            navigator.vibrate([30, 50, 30]);
            break;
        default:
            navigator.vibrate(10);
    }
}
