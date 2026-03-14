/**
 * Generates a very short, subtle "click" sound using the Web Audio API.
 */
let audioCtx: any = null;

function getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        audioCtx = new AudioContextClass();
    }
    return audioCtx;
}

function triggerClickSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        if (ctx.state === 'suspended') ctx.resume();
        
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
/**
 * Generates a "coin" sound (Success/Reward)
 */
export function triggerCoinSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    try {
        if (ctx.state === 'suspended') ctx.resume();
        
        const playTone = (freq: number, start: number, duration: number, volume: number) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
            
            g.gain.setValueAtTime(0, ctx.currentTime + start);
            g.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration);
            
            osc.connect(g);
            g.connect(ctx.destination);
            
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
        };

        // Premium "Ting!" - Harmonious chords
        playTone(987.77, 0, 0.4, 0.15); // B5
        playTone(1318.51, 0.05, 0.4, 0.1); // E6
        playTone(1975.53, 0.1, 0.5, 0.05); // B6
        
    } catch (e) {
        console.warn('Audio check failed', e);
    }
}
