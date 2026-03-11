"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Tour, TourScene, TourHotspot } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    Save, ArrowLeft, Plus, MapPin,
    Trash2, ChevronRight, Eye, Info,
    MousePointer2, HelpCircle, Move, Settings2,
    Maximize, Navigation, Sparkles, Wand2, Link2,
    ArrowRightLeft, Camera
} from "lucide-react";
import MarzipanoViewer from "./MarzipanoViewer";
import { rtdb } from "@/lib/firebase";
import { ref, set, remove } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { optimizeImage } from "@/lib/image-optimizer";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { generateTourAction } from "@/app/actions/tourAi";
import { buildTourFromAIGraph } from "@/lib/tour-engine/tourBuilder";

interface TourEditorProps {
    tour: Tour;
    onSave?: () => void;
}

export default function TourEditor({ tour, onSave }: TourEditorProps) {
    const [currentSceneId, setCurrentSceneId] = useState(tour.firstSceneId || Object.keys(tour.scenes)[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [localTour, setLocalTour] = useState<Tour>(tour);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const viewerRef = useRef<any>(null);

    // States for Manual Editing
    const [isAddMode, setIsAddMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{ pitch: number, yaw: number } | null>(null);
    const [targetRoomId, setTargetRoomId] = useState<string>("");

    const scenesArray = Object.values(localTour.scenes);
    const currentScene = localTour.scenes[currentSceneId];

    const autoConnectTourWithAI = async () => {
        const scenes = Object.values(localTour.scenes);
        if (scenes.length < 2) {
            alert("Faça o upload de pelo menos 2 fotos para que a IA construa o tour!");
            return;
        }

        setIsSaving(true);

        try {
            // 1. Prepare images list with URLs
            const imagesForAI = scenes.map(scene => ({
                id: scene.id,
                name: scene.name,
                url: scene.panoramaUrl
            }));

            // 2. Query Gemini Vision via Server Action
            const aiGraph = await generateTourAction(imagesForAI);

            if (aiGraph.requiresConfirmation) {
                alert("⚠️ A Inteligência Artificial organizou seu tour, mas há conexões com baixa certeza. Verifique a aba lateral direita para confirmar os caminhos exatos!");
            }

            // 3. Build internal Tour object
            const urlsMap = scenes.reduce((acc, scene) => {
                acc[scene.id] = scene.panoramaUrl;
                return acc;
            }, {} as Record<string, string>);
            
            const newTourObject = await buildTourFromAIGraph(localTour.id, localTour.userId, aiGraph, urlsMap);

            setLocalTour({
                ...localTour,
                scenes: newTourObject.scenes,
                firstSceneId: newTourObject.firstSceneId,
                updatedAt: new Date().toISOString()
            });

            if (newTourObject.firstSceneId) {
                setCurrentSceneId(newTourObject.firstSceneId);
            }
            
            alert("✨ IA: Ambientes detectados e tour montado com sucesso!");
        } catch (error) {
            console.error("AI Auto-Link Error:", error);
            alert("Houve um problema ao processar a IA. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const setCurrentAsInitial = () => {
        if (!viewerRef.current) return;
        
        const state = viewerRef.current.getViewState();
        if (state) {
            updateSceneSettings(currentSceneId, {
                initialPitch: state.pitch,
                initialYaw: state.yaw,
                initialHfov: state.hfov
            });
            alert("📸 Visão inicial definida para este ambiente!");
        }
    };

    const updateSceneSettings = (sceneId: string, updates: Partial<TourScene>) => {
        const updatedScenes = { ...localTour.scenes };
        updatedScenes[sceneId] = {
            ...updatedScenes[sceneId],
            ...updates
        };

        setLocalTour({
            ...localTour,
            scenes: updatedScenes,
            updatedAt: new Date().toISOString()
        });
    };

    const removeHotspot = (hotspotId: string) => {
        const updatedScenes = { ...localTour.scenes };
        const updatedHotspots = (currentScene.hotspots || []).filter(h => h.id !== hotspotId);

        updatedScenes[currentSceneId] = {
            ...currentScene,
            hotspots: updatedHotspots
        };

        setLocalTour({
            ...localTour,
            scenes: updatedScenes
        });
    };

    const handleAddScene = async (file: File) => {
        setIsUploading(true);
        try {
            const optimized = await optimizeImage(file);
            const url = await uploadToCloudinary(optimized);

            const newSceneId = uuidv4();
            const newScene: TourScene = {
                id: newSceneId,
                name: file.name.split('.')[0] || "Ambiente",
                panoramaUrl: url,
                hotspots: [],
                initialHfov: 120,
                initialPitch: 0,
                initialYaw: 0
            };

            const updatedScenes = { ...localTour.scenes, [newSceneId]: newScene };
            setLocalTour({ ...localTour, scenes: updatedScenes });
            setCurrentSceneId(newSceneId);
        } catch (error) {
            console.error("Error adding scene:", error);
            alert("Erro ao enviar imagem.");
        } finally {
            setIsUploading(false);
        }
    };

    // ============ MANUAL HOTSPOT LOGIC ============
    
    const handlePointClick = useCallback((pitch: number, yaw: number) => {
        if (!isAddMode) return;
        setSelectedCoords({ pitch, yaw });
        setIsModalOpen(true);
        setIsAddMode(false); // turn off add mode after click
    }, [isAddMode]);

    const confirmHotspot = () => {
        if (!selectedCoords || !targetRoomId) return;

        const updatedScenes = { ...localTour.scenes };
        const newHotspot: TourHotspot = {
            id: uuidv4(),
            pitch: selectedCoords.pitch,
            yaw: selectedCoords.yaw,
            targetSceneId: targetRoomId,
            text: `Ir para ${localTour.scenes[targetRoomId]?.name || "Ambiente"}`
        };

        updatedScenes[currentSceneId] = {
            ...currentScene,
            hotspots: [...(currentScene.hotspots || []), newHotspot]
        };

        setLocalTour({
            ...localTour,
            scenes: updatedScenes,
            updatedAt: new Date().toISOString()
        });

        setIsModalOpen(false);
        setTargetRoomId("");
        setSelectedCoords(null);
    };

    const deleteScene = (sceneId: string) => {
        if (scenesArray.length <= 1) {
            alert("O tour deve ter pelo menos um ambiente.");
            return;
        }

        if (!confirm(`Excluir ambiente "${localTour.scenes[sceneId]?.name}"?`)) return;

        const updatedScenes = { ...localTour.scenes };
        delete updatedScenes[sceneId];

        const nextSceneId = currentSceneId === sceneId ? Object.keys(updatedScenes)[0] : currentSceneId;

        setLocalTour({
            ...localTour,
            scenes: updatedScenes,
            firstSceneId: localTour.firstSceneId === sceneId ? nextSceneId : localTour.firstSceneId
        });
        setCurrentSceneId(nextSceneId);
    };

    const saveTour = async () => {
        setIsSaving(true);
        try {
            const tourRef = ref(rtdb, `tours/${localTour.id}`);
            await set(tourRef, {
                ...localTour,
                published: true,
                updatedAt: new Date().toISOString()
            });
            if (onSave) onSave();
        } catch (error) {
            console.error("Error saving tour:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[700px]">
            {/* Left: Environments List */}
            <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
                <Card padding="md" className="flex-1 flex flex-col gap-4 overflow-hidden border-slate-200 shadow-xl bg-slate-50/30">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-display font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                            Ambientes <Badge variant="default" className="text-[10px] px-1.5 bg-slate-200 text-slate-700">{scenesArray.length}</Badge>
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {scenesArray.map(scene => (
                            <button
                                key={scene.id}
                                onClick={() => setCurrentSceneId(scene.id)}
                                className={`w-full group relative flex flex-col p-2 rounded-xl text-left border transition-all ${currentSceneId === scene.id
                                    ? "bg-white border-brand-500 shadow-md ring-1 ring-brand-500/20"
                                    : "bg-white/50 border-slate-200 hover:bg-white"
                                    }`}
                            >
                                <div className="aspect-[16/9] w-full rounded-lg overflow-hidden mb-2 bg-slate-100">
                                    <img src={scene.panoramaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <span className={`text-xs font-bold truncate ${currentSceneId === scene.id ? "text-slate-900" : "text-slate-500"}`}>
                                        {scene.name}
                                    </span>
                                    {currentSceneId === scene.id && <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-2 border-dashed border-2 py-8 rounded-2xl hover:bg-brand-50 hover:border-brand-300 group transition-all"
                        onClick={() => fileInputRef.current?.click()}
                        loading={isUploading}
                    >
                        <Plus className="h-5 w-5 text-slate-400 group-hover:text-brand-600" />
                        <span className="text-sm font-bold text-slate-500 group-hover:text-brand-600">Adicionar Fotos</span>
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={(e) => {
                        if (e.target.files) {
                            Array.from(e.target.files).forEach(file => handleAddScene(file));
                        }
                    }} />
                </Card>
            </div>

            {/* Middle: Professional Preview */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Construção Inteligente</h2>
                        <span className="text-[10px] text-brand-600 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                           <Sparkles className="h-3 w-3" /> IA Gerenciando o Fluxo
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={autoConnectTourWithAI}
                            variant="primary"
                            size="lg"
                            className="gap-2 bg-gradient-to-r from-brand-600 to-brand-500 border-none text-white hover:scale-105 active:scale-95 transition-all shadow-lg rounded-2xl px-6"
                            loading={isSaving}
                        >
                            <Wand2 className="h-5 w-5" />
                            <span className="font-bold text-xs uppercase tracking-widest">Finalizar com IA</span>
                        </Button>
                    </div>
                </div>

                <Card padding="none" className={`relative flex-1 overflow-hidden border border-slate-200 shadow-2xl rounded-[40px] transition-all duration-500 bg-transparent ${isAddMode ? 'ring-4 ring-brand-500/50 cursor-crosshair' : ''}`}>
                    <MarzipanoViewer
                        ref={viewerRef}
                        tour={localTour}
                        initialSceneId={currentSceneId}
                        onSceneChange={setCurrentSceneId}
                        showControls={true}
                        captureMode={isAddMode}
                        onPointClick={handlePointClick}
                        className="w-full h-full"
                    />

                    {/* Editor Overlays */}
                    <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                        <Badge className="bg-slate-900/80 backdrop-blur-xl border-white/10 py-3 px-5 rounded-[20px] shadow-2xl">
                             <div className="h-2 w-2 rounded-full bg-brand-500 mr-3 animate-pulse" />
                             <span className="text-white font-bold text-xs tracking-tight">{currentScene?.name}</span>
                        </Badge>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={setCurrentAsInitial}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md text-slate-800 rounded-xl border border-slate-200 hover:bg-brand-50 hover:border-brand-200 transition-all shadow-lg group"
                            >
                                <Camera className="h-4 w-4 text-brand-500 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-[10px] uppercase tracking-wider">Definir Visão Inicial</span>
                            </button>
                            <button
                                onClick={() => setIsAddMode(!isAddMode)}
                                className={`flex items-center gap-2 px-4 py-2.5 backdrop-blur-md rounded-xl border transition-all shadow-lg group ${isAddMode ? 'bg-brand-600 border-brand-500 text-white' : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-brand-50 hover:border-brand-200'}`}
                            >
                                <MapPin className={`h-4 w-4 ${isAddMode ? 'text-white' : 'text-brand-500'} group-hover:scale-110 transition-transform`} />
                                <span className="font-bold text-[10px] uppercase tracking-wider">
                                    {isAddMode ? "Cancelar Inserção" : "Ponto Manual"}
                                </span>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right: Scene Configuration */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
                <Card padding="md" className="space-y-6 overflow-y-auto custom-scrollbar border-slate-200 shadow-xl rounded-[32px] bg-slate-50/20">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                       <h3 className="font-display font-black text-slate-900 uppercase tracking-widest text-xs">Ajustes Finos</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Ambiente</label>
                        <input
                            value={currentScene?.name || ""}
                            onChange={(e) => updateSceneSettings(currentSceneId, { name: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 bg-white"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Conexões Manual ({currentScene?.hotspots?.length || 0})
                        </label>

                        <div className="space-y-2">
                            {currentScene?.hotspots && currentScene.hotspots.length > 0 ? (
                                currentScene.hotspots.map(hs => (
                                    <div key={hs.id} className={`flex flex-col gap-2 p-3 bg-white rounded-2xl border ${hs.isUncertain ? "border-amber-400 bg-amber-50" : "border-slate-200"} hover:border-brand-300 transition-all shadow-sm`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <p className="text-[11px] font-black text-slate-900 truncate uppercase mt-0.5">{localTour.scenes[hs.targetSceneId]?.name}</p>
                                                {hs.isUncertain && <span className="bg-amber-100 text-amber-600 text-[9px] px-1.5 py-0.5 rounded font-bold">REVISAR</span>}
                                            </div>
                                            <button onClick={() => removeHotspot(hs.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                ))
                            ) : (
                                <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sem conexões</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col gap-3">
                        <Button
                            className="w-full py-8 rounded-3xl shadow-2xl transition-all transform active:scale-95 bg-slate-900 border-none hover:bg-brand-600"
                            onClick={saveTour}
                            loading={isSaving}
                            leftIcon={<Save className="h-5 w-5" />}
                        >
                            <span className="font-black uppercase tracking-[0.2em] text-xs">Salvar Tour</span>
                        </Button>
                        <button onClick={() => deleteScene(currentSceneId)} className="w-full py-4 text-red-500 font-black uppercase tracking-widest text-[9px] hover:bg-red-50 rounded-2xl transition-all">
                            Excluir este Ambiente
                        </button>
                        <Link href="/tours" className="text-center flex justify-center mt-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 cursor-pointer">Sair do Editor</span>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Modal para Escolher Destino Manual */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card padding="lg" className="w-full max-w-md space-y-4 relative shadow-2xl border-none">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            x
                        </button>
                        <h3 className="font-display font-bold text-lg text-slate-900">Adicionar Conexão</h3>
                        <p className="text-sm text-slate-500">
                            Para qual ambiente este ponto deve levar?
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {scenesArray
                                .filter((s) => s.id !== currentSceneId)
                                .map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setTargetRoomId(s.id);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                                            targetRoomId === s.id 
                                                ? "border-brand-500 bg-brand-50" 
                                                : "border-slate-200 hover:border-brand-300"
                                        }`}
                                    >
                                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                                    </button>
                                ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button 
                                onClick={confirmHotspot}
                                disabled={!targetRoomId}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

        </div>

    );
}
