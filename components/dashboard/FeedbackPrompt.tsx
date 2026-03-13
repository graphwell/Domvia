"use client";

import { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ThumbsUp, ThumbsDown, X, Star } from "lucide-react";
import { rtdb } from "@/lib/firebase";
import { ref, set, push, get } from "firebase/database";
import { useAuth } from "@/hooks/auth-provider";

export function FeedbackPrompt() {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showNegativeForm, setShowNegativeForm] = useState(false);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!user) return;

        const checkUsage = async () => {
            // Only show after at least 5 tool usage events and if not shown before
            const statsRef = ref(rtdb, `usage_stats/${user.id}`);
            const snap = await get(statsRef);
            const stats = snap.val() || {};
            
            const totalUsage = Object.keys(stats).reduce((acc, key) => {
                if (key !== 'last_seen') return acc + (stats[key] || 0);
                return acc;
            }, 0);

            const feedbackRef = ref(rtdb, `feedbacks/${user.id}`);
            const feedbackSnap = await get(feedbackRef);

            if (totalUsage >= 5 && !feedbackSnap.exists()) {
                setIsVisible(true);
            }
        };

        checkUsage();
    }, [user]);

    const handleFeedback = async (positive: boolean) => {
        if (positive) {
            await set(ref(rtdb, `feedbacks/${user!.id}`), {
                rating: 'positive',
                timestamp: Date.now()
            });
            setSubmitted(true);
            setTimeout(() => setIsVisible(false), 3000);
        } else {
            setShowNegativeForm(true);
        }
    };

    const submitComment = async () => {
        await set(ref(rtdb, `feedbacks/${user!.id}`), {
            rating: 'negative',
            comment,
            timestamp: Date.now()
        });
        setSubmitted(true);
        setTimeout(() => setIsVisible(false), 3000);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-fade-up">
            <Card className="shadow-2xl border-brand-100 overflow-hidden" padding="none">
                <div className="bg-brand-600 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-white fill-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Domvia Feedback</span>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 text-center">
                    {submitted ? (
                        <div className="py-4 animate-fade-in">
                            <p className="text-brand-600 font-bold">Obrigado pelo seu feedback! ❤️</p>
                            <p className="text-xs text-slate-500 mt-1">Isso nos ajuda a evoluir o Domvia.</p>
                        </div>
                    ) : showNegativeForm ? (
                        <div className="space-y-3 animate-fade-in">
                            <h4 className="text-sm font-bold text-slate-900">Como podemos melhorar?</h4>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Sua opinião é muito importante..."
                                className="w-full text-xs rounded-xl border border-slate-200 p-3 h-24 focus:border-brand-400 focus:outline-none"
                            />
                            <Button size="sm" className="w-full" onClick={submitComment}>Enviar Comentário</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-slate-900 font-bold">Você está gostando do Domvia?</h4>
                            <div className="flex gap-3">
                                <Button 
                                    variant="secondary" 
                                    className="flex-1 gap-2" 
                                    onClick={() => handleFeedback(true)}
                                >
                                    <ThumbsUp className="h-4 w-4 text-emerald-500" /> Sim!
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="flex-1 gap-2"
                                    onClick={() => handleFeedback(false)}
                                >
                                    <ThumbsDown className="h-4 w-4 text-slate-400" /> Não muito
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
