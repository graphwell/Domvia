// lib/tour-engine/marzipanoEngine.ts

// Since marzipano doesn't have official TS types in all environments, we use any for its internal objects.
// In a real production scenario, you might want to create a declarations file.
let Marzipano: any;

if (typeof window !== "undefined") {
    // We dynamically require to avoid SSR issues
    Marzipano = require("marzipano");
}

export interface HotspotConfig {
    yaw: number;
    pitch: number;
    targetSceneId: string;
    label?: string;
}

export interface SceneConfig {
    id: string;
    name: string;
    panoramaUrl: string;
    initialYaw?: number;
    initialPitch?: number;
    initialFov?: number;
    hotspots?: HotspotConfig[];
}

export class TourEngine {
    private viewer: any = null;
    private scenesMap: Record<string, any> = {};
    private currentSceneId: string | null = null;
    private container: HTMLElement;
    
    // Callbacks
    public onSceneChange?: (sceneId: string) => void;

    constructor(container: HTMLElement) {
        if (!Marzipano) {
            throw new Error("Marzipano not loaded or running in SSR");
        }
        this.container = container;
        
        const viewerOpts = {
            controls: {
                mouseViewMode: 'drag'
            }
        };
        
        this.viewer = new Marzipano.Viewer(container, viewerOpts);
        console.log("[TourEngine] Initialized Marzipano Viewer");
    }

    public destroy() {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
        this.scenesMap = {};
        console.log("[TourEngine] Destroyed Viewer");
    }

    public getViewer() {
        return this.viewer;
    }

    public loadScenes(sceneConfigs: SceneConfig[]) {
        if (!this.viewer) return;
        
        this.scenesMap = {};

        // Default geometry and view limits for 360 equirectangular panoramas
        // To handle flat/partial panoramas gracefully, we assume a standard size 
        // and let Marzipano handle the projection.
        const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);

        sceneConfigs.forEach(config => {
            const lim = Marzipano.RectilinearView.limit.traditional(1024, 140 * Math.PI / 180);
            
            const view = new Marzipano.RectilinearView({ 
                yaw: config.initialYaw !== undefined ? (config.initialYaw * Math.PI / 180) : 0, 
                pitch: config.initialPitch !== undefined ? (config.initialPitch * Math.PI / 180) : 0, 
                fov: config.initialFov !== undefined ? (config.initialFov * Math.PI / 180) : (90 * Math.PI / 180) 
            }, lim);

            const source = Marzipano.ImageUrlSource.fromString(config.panoramaUrl);

            const scene = this.viewer.createScene({
                source: source,
                geometry: geometry,
                view: view,
                pinFirstLevel: true
            });

            // Store custom data on the scene object
            scene.tourData = {
                id: config.id,
                name: config.name,
                hotspots: config.hotspots || []
            };

            this.scenesMap[config.id] = scene;
        });

        console.log(`[TourEngine] Loaded ${Object.keys(this.scenesMap).length} scenes`);
    }

    public createHotspotElement(hotspot: HotspotConfig): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'marzipano-hotspot-wrapper';
        wrapper.style.cursor = 'pointer';

        const dot = document.createElement('div');
        dot.className = 'custom-hotspot'; // Reusing your existing global CSS class
        
        if (hotspot.label) {
            const label = document.createElement('div');
            label.className = 'pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur-sm opacity-0 transition-opacity duration-200';
            label.textContent = hotspot.label;
            
            wrapper.appendChild(label);
            
            wrapper.addEventListener('mouseenter', () => label.style.opacity = '1');
            wrapper.addEventListener('mouseleave', () => label.style.opacity = '0');
        }

        wrapper.appendChild(dot);

        // Click event to switch scenes
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent propagating to the viewer drag
            this.switchScene(hotspot.targetSceneId);
        });

        return wrapper;
    }

    private setupHotspots(sceneId: string) {
        const scene = this.scenesMap[sceneId];
        if (!scene) return;

        // Clear existing hotspots in this scene (Marzipano handles this mostly on scene switch,
        // but it's good practice to ensure we're adding the current ones).
        const hotspotsData: HotspotConfig[] = scene.tourData.hotspots;

        hotspotsData.forEach(hs => {
            const element = this.createHotspotElement(hs);
            scene.hotspotContainer().createHotspot(element, { 
                yaw: hs.yaw * Math.PI / 180, 
                pitch: hs.pitch * Math.PI / 180 
            });
        });
    }

    public switchScene(sceneId: string, transitionOptions?: any) {
        if (!this.viewer || !this.scenesMap[sceneId]) {
            console.warn(`[TourEngine] Cannot switch to scene: ${sceneId}`);
            return;
        }

        const scene = this.scenesMap[sceneId];
        
        // Default crossfade transition
        const defaults = {
            transitionDuration: 1000
        };

        const opts = { ...defaults, ...transitionOptions };

        scene.switchTo(opts);
        this.currentSceneId = sceneId;
        
        // Setup hotspots for the new scene
        this.setupHotspots(sceneId);

        if (this.onSceneChange) {
            this.onSceneChange(sceneId);
        }

        console.log(`[TourEngine] Switched to scene: ${sceneId}`);
        
        // Trigger resize event after transition to ensure layout is perfect
        setTimeout(() => this.viewer.resize(), 100);
    }
    
    public getCurrentSceneId() {
        return this.currentSceneId;
    }
    
    public setViewParameters(pitch: number, yaw: number, fov: number) {
        if (!this.viewer || !this.currentSceneId) return;
        const scene = this.scenesMap[this.currentSceneId];
        if (scene) {
            const view = scene.view();
            view.setPitch(pitch * Math.PI / 180);
            view.setYaw(yaw * Math.PI / 180);
            view.setFov(fov * Math.PI / 180);
        }
    }
    
    public getViewState() {
        if (!this.viewer || !this.currentSceneId) return null;
        const scene = this.scenesMap[this.currentSceneId];
        if (scene) {
            const view = scene.view();
            return {
                pitch: view.pitch() * 180 / Math.PI,
                yaw: view.yaw() * 180 / Math.PI,
                fov: view.fov() * 180 / Math.PI
            };
        }
        return null;
    }
}
