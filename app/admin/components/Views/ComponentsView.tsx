"use client";

import React from "react";
import { Layout } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch";
import { useComponentSettings } from "@/app/_context/ComponentSettingsContext";

const ComponentsView = () => {
    const { settings, toggleComponent } = useComponentSettings();

    const componentsList = [
        { id: "Hero", label: "Hero Banner", description: "The top introductory banner of the home page." },
        { id: "WhoWeAre", label: "Who We Are Section", description: "Company introduction section." },
        { id: "WhatWeOffer", label: "What We Offer Section", description: "The section displaying company offerings on the home page." },
        { id: "FeaturedProducts", label: "Featured Products", description: "Highlights curated products on the front page." },
        { id: "ShopSection", label: "Shop Section", description: "The section displaying shop items." },
        { id: "Contact", label: "Contact Us Section", description: "Contact details and forms." },
        { id: "Footer", label: "Site Footer", description: "The global footer appearing at the bottom of pages." },
        { id: "LoginSignup", label: "Login/Signup Modal", description: "The authentication component for new and returning users." },
    ] as const;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Layout className="size-5 text-teal-600" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Global Component Settings</h2>
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {componentsList.map((comp) => (
                        <div key={comp.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{comp.label}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{comp.description}</p>
                            </div>
                            <ToggleSwitch
                                isOn={settings[comp.id as keyof typeof settings]}
                                onToggle={() => toggleComponent(comp.id as keyof typeof settings)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComponentsView;
