"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/hooks/use-language";
import { MessageSquare, User, Bell, AppWindow } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const { t } = useLanguage();

    const SETTINGS_GROUPS = [
        {
            title: t("settings.groups.opinion"),
            items: [
                {
                    id: "suggestions",
                    label: t("settings.items.suggestions.label"),
                    description: t("settings.items.suggestions.desc"),
                    icon: MessageSquare,
                    href: "/settings/suggestions",
                    color: "text-brand-600 bg-brand-50"
                }
            ]
        },
        {
            title: t("settings.groups.account"),
            items: [
                {
                    id: "profile",
                    label: t("settings.items.profile.label"),
                    description: t("settings.items.profile.desc"),
                    icon: User,
                    href: "/settings/profile",
                    color: "text-blue-600 bg-blue-50"
                }
            ]
        },
        {
            title: t("settings.groups.preferences"),
            items: [
                {
                    id: "notifications",
                    label: t("settings.items.notifications.label"),
                    description: t("settings.items.notifications.desc"),
                    icon: Bell,
                    href: "/settings/notifications",
                    color: "text-amber-600 bg-amber-50"
                },
                {
                    id: "branding",
                    label: t("settings.items.branding.label"),
                    description: t("settings.items.branding.desc"),
                    icon: AppWindow,
                    href: "/settings/branding",
                    color: "text-purple-600 bg-purple-50"
                }
            ]
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-black text-slate-900 font-display">{t("settings.title")}</h1>
                <p className="text-slate-500 mt-2">{t("settings.subtitle")}</p>
            </div>

            <div className="space-y-10">
                {SETTINGS_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                            {group.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.items.map((item) => (
                                <Link key={item.id} href={item.href}>
                                    <Card hover className="h-full group">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-2xl shrink-0 transition-colors ${item.color}`}>
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-slate-900 transition-colors group-hover:text-brand-600">
                                                    {item.label}
                                                </h3>
                                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
