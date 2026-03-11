import { Tour, TourScene, TourHotspot } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { AITourGraph } from "@/lib/ai";

export async function buildTourFromAIGraph(
    tourId: string, 
    userId: string, 
    graph: AITourGraph, 
    imageUrls: Record<string, string> // Map of imageId -> raw remote URL
): Promise<Tour> {
    
    const scenes: Record<string, TourScene> = {};

    graph.rooms.forEach(room => {
        // Find hotspots originating from this room
        const roomConnections = graph.connections.filter(c => c.from === room.id);
        
        const hotspots: TourHotspot[] = roomConnections.map(conn => ({
            id: uuidv4(),
            pitch: conn.pitch,
            yaw: conn.yaw,
            targetSceneId: conn.to,
            text: conn.label || `Ir para ${graph.rooms.find(r => r.id === conn.to)?.name || "Ambiente"}`,
            isUncertain: conn.confidence !== undefined ? conn.confidence < 0.6 : false
        }));

        const sceneId = room.id;
        
        scenes[sceneId] = {
            id: sceneId,
            name: `${room.name} (${room.type})`,
            panoramaUrl: imageUrls[room.id] || "",
            hotspots: hotspots,
            initialHfov: 120,
            initialPitch: 0,
            initialYaw: 0
        };
    });

    // Make sure the suggested first scene actually exists, otherwise fallback to the first key
    let firstSceneId = graph.suggestedFirstSceneId;
    if (!firstSceneId || !scenes[firstSceneId]) {
        firstSceneId = Object.keys(scenes)[0];
    }

    const newTour: Tour = {
        id: tourId,
        title: "Tour Gerado por IA",
        userId: userId,
        published: false,
        scenes: scenes,
        firstSceneId: firstSceneId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return newTour;
}
