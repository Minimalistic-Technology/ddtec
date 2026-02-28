"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface ComponentSettings {
    WhatWeOffer: boolean;
    Footer: boolean;
    ShopSection: boolean;
    Hero: boolean;
    WhoWeAre: boolean;
    FeaturedProducts: boolean;
    Contact: boolean;
    LoginSignup: boolean;
}

const defaultSettings: ComponentSettings = {
    WhatWeOffer: true,
    Footer: true,
    ShopSection: true,
    Hero: true,
    WhoWeAre: true,
    FeaturedProducts: true,
    Contact: true,
    LoginSignup: true,
};

interface ComponentSettingsContextType {
    settings: ComponentSettings;
    toggleComponent: (componentName: keyof ComponentSettings) => void;
}

const ComponentSettingsContext = createContext<ComponentSettingsContextType | undefined>(undefined);

export const ComponentSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<ComponentSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data?.components) {
                setSettings({ ...defaultSettings, ...res.data.components });
            }
        } catch (error) {
            console.error("Failed to fetch component settings", error);
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const toggleComponent = async (componentName: keyof ComponentSettings) => {
        const next = { ...settings, [componentName]: !settings[componentName] };
        // Optimistic UI update
        setSettings(next);
        try {
            const token = localStorage.getItem('ddtec_token');
            await api.put('/settings', { components: next }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to update component settings", error);
            // Revert on failure
            setSettings(settings);
            alert("Failed to save global component setting. Ensure you are an active super_admin.");
        }
    };

    if (!isLoaded) return null; // Avoid hydration mismatch

    return (
        <ComponentSettingsContext.Provider value={{ settings, toggleComponent }}>
            {children}
        </ComponentSettingsContext.Provider>
    );
};

export const useComponentSettings = () => {
    const context = useContext(ComponentSettingsContext);
    if (context === undefined) {
        throw new Error("useComponentSettings must be used within a ComponentSettingsProvider");
    }
    return context;
};
