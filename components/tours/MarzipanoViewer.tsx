"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { TourEngine, SceneConfig } from '@/lib/tour-engine/marzipanoEngine';
import { Tour } from '@/types';

interface MarzipanoViewerProps {
    tour?: Tour;
    imageUrl?: string;
    initialSceneId?: string;
    className?: string;
    onSceneChange?: (sceneId: string) => void;
    onPointClick?: (pitch: number, yaw: number) => void;
    showControls?: boolean;
    captureMode?: boolean;
    title?: string;
}

const MarzipanoViewer = forwardRef<any, MarzipanoViewerProps>(({
    tour,
    imageUrl,
    initialSceneId,
    className = "w-full h-full min-h-[500px] rounded-[32px] overflow-hidden shadow-2xl relative",
    onSceneChange,
    onPointClick,
    showControls = true,
    captureMode = false,
    title
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<TourEngine | null>(null);
    const [currentSceneId, setCurrentSceneId] = useState<string | null>(initialSceneId || null);
    const [hfov, setHfov] = useState(90);

    useImperativeHandle(ref, () => ({
        getViewState: () => {
            if (engineRef.current) {
                return engineRef.current.getViewState();
            }
            return null;
        },
        setViewParameters: (pitch: number, yaw: number, fov: number) => {
            if (engineRef.current) {
                engineRef.current.setViewParameters(pitch, yaw, fov);
            }
        }
    }));

    useEffect(() => {
        if (!containerRef.current) return;

        // Ensure Marzipano only initializes inside a browser context
        const initViewer = async () => {
             // Small delay to ensure the container has laid out properly in React
             await new Promise(r => setTimeout(r, 50));
             
             if (!containerRef.current) return;

            try {
                if (!engineRef.current) {
                    engineRef.current = new TourEngine(containerRef.current);
                }

                // Prepare scenes
                let scenes: SceneConfig[] = [];
                let targetFirstScene = currentSceneId || initialSceneId;

                if (tour) {
                    scenes = Object.values(tour.scenes).map(scene => ({
                        id: scene.id,
                        name: scene.name || "Cena",
                        panoramaUrl: scene.panoramaUrl,
                        initialYaw: scene.initialYaw,
                        initialPitch: scene.initialPitch,
                        initialFov: scene.initialHfov,
                        hotspots: (scene.hotspots || []).map(hs => ({
                            yaw: hs.yaw,
                            pitch: hs.pitch,
                            targetSceneId: hs.targetSceneId,
                            label: hs.text
                        }))
                    }));

                    if (!targetFirstScene) {
                        targetFirstScene = tour.firstSceneId || scenes[0]?.id;
                    }
                } else if (imageUrl) {
                    const fallbackId = "single-image-scene";
                    scenes = [{
                        id: fallbackId,
                        name: title || "Visão 360",
                        panoramaUrl: imageUrl
                    }];
                    targetFirstScene = fallbackId;
                }

                if (scenes.length > 0) {
                    engineRef.current.loadScenes(scenes);
                    
                    if (targetFirstScene) {
                        engineRef.current.switchScene(targetFirstScene);
                        setCurrentSceneId(targetFirstScene);
                    }

                    engineRef.current.onSceneChange = (sceneId) => {
                        setCurrentSceneId(sceneId);
                        if (onSceneChange) onSceneChange(sceneId);
                    };
                }
            } catch (error) {
                console.error("Failed to initialize MarzipanoViewer:", error);
            }
        };

        let active = true;
        if (active) {
            initViewer();
        }

        // Click handler for capture mode
        const handleClick = (e: MouseEvent) => {
            if (!captureMode || !engineRef.current || !onPointClick || !containerRef.current) return;
            
            const viewer = engineRef.current.getViewer();
            if (!viewer) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const view = viewer.view();
            if (view && view.screenToCoordinates) {
                const coords = view.screenToCoordinates({ x, y });
                if (coords) {
                    // Convert back to degrees for the Editor
                    const pitchDeg = coords.pitch * 180 / Math.PI;
                    const yawDeg = coords.yaw * 180 / Math.PI;
                    onPointClick(pitchDeg, yawDeg);
                }
            }
        };

        const container = containerRef.current;
        container.addEventListener('click', handleClick);

        return () => {
            active = false;
            if (container) {
                container.removeEventListener('click', handleClick);
            }
            if (engineRef.current) {
                engineRef.current.destroy();
                engineRef.current = null;
            }
        };
    }, [tour?.id, imageUrl, captureMode, onPointClick]); 

    // Sync external scene changes
    useEffect(() => {
        if (engineRef.current && initialSceneId && initialSceneId !== currentSceneId) {
            engineRef.current.switchScene(initialSceneId);
        }
    }, [initialSceneId, currentSceneId]);

    const handleZoom = (delta: number) => {
        if (engineRef.current) {
            const state = engineRef.current.getViewState();
            if (state) {
                let newFov = state.fov + delta;
                if (newFov < 40) newFov = 40;
                if (newFov > 120) newFov = 120;
                engineRef.current.setViewParameters(state.pitch, state.yaw, newFov);
                setHfov(newFov);
            }
        }
    };

    const toggleFullScreen = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen().catch(err => {
                    console.error("Error attempting to enable full-screen mode:", err);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    const scenesArray = tour ? Object.values(tour.scenes) : [];
    const activeScene = tour?.scenes[currentSceneId || ""];
    const activeSceneName = activeScene?.name || title || "";

    return (
        <div className={`relative ${className} ${captureMode ? "cursor-crosshair" : "cursor-default"} group/viewer`}>
            
            {/* The actual Marzipano container */}
            <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full bg-slate-900" style={{ pointerEvents: captureMode ? 'auto' : 'auto' }} />

            {/* Overlays */}
            {showControls && (
                <>
                    {/* Top Left: Scene Title */}
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                        <div className="bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                            <span className="text-white font-display font-medium tracking-tight whitespace-nowrap">
                                {activeSceneName}
                            </span>
                        </div>
                    </div>

                    {/* Top Right: Actions */}
                    <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                        <button
                            onClick={toggleFullScreen}
                            className="p-3 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl border border-white/10 hover:bg-brand-600 transition-all shadow-xl"
                            title="Tela Cheia"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                    </div>

                    {/* Bottom: Thumbnails & Zoom */}
                    <div className="absolute bottom-8 left-0 right-0 z-20 px-6 flex flex-col items-center gap-6">
                        
                        {/* Zoom Controls */}
                        <div className="bg-slate-900/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-6 max-w-sm w-full">
                            <button onClick={() => handleZoom(10)} className="text-white/60 hover:text-white transition-colors" title="Afastar">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            </button>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute inset-y-0 left-0 bg-brand-500 transition-all duration-300"
                                    style={{ width: `${Math.max(0, Math.min(100, ((hfov - 40) / 80) * 100))}%` }}
                                />
                            </div>
                            <button onClick={() => handleZoom(-10)} className="text-white/60 hover:text-white transition-colors" title="Aproximar">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 7v10m-5-5h10" /></svg>
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {scenesArray.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 max-w-full scrollbar-none w-full justify-center px-4">
                                {scenesArray.map((scene) => (
                                    <button
                                        key={scene.id}
                                        onClick={() => {
                                            if (engineRef.current) engineRef.current.switchScene(scene.id);
                                        }}
                                        className={`group relative flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-300 ${currentSceneId === scene.id ? "scale-110" : "opacity-60 hover:opacity-100"}`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${currentSceneId === scene.id ? "border-brand-500 shadow-glow" : "border-white/10"}`}>
                                            <img src={scene.panoramaUrl} className="w-full h-full object-cover" alt={scene.name} />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${currentSceneId === scene.id ? "text-brand-400" : "text-white/40"}`}>
                                            {scene.name}
                                        </span>
                                        {currentSceneId === scene.id && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
});

export default MarzipanoViewer;
