/**
 * Generates a very short, subtle "click" sound using the Web Audio API.
 */
function triggerClickSound() {
    if (typeof window === "undefined") return;
    try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const ctx = new AudioContextClass();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
        console.warn("Audio feedback failed:", e);
    }
}

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
    // Play sound on every interaction for feedback
    triggerClickSound();

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
