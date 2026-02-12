
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import axios from "axios";

const Contact: React.FC = () => {
    const { user } = useAuth();
    const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setFormState("submitting");

        const formData = new FormData(form);
        const data = {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            message: formData.get("message"),
        };

        try {
            const response = await axios.post('/api/contact', {
                ...data,
                userId: user?.id
            });

            if (response.status === 200 || response.status === 201) {
                setFormState("success");
                form.reset();
                setTimeout(() => setFormState("idle"), 3000);
            } else {
                setFormState("error");
                setTimeout(() => setFormState("idle"), 3000);
            }
        } catch (error) {
            setFormState("error");
            setTimeout(() => setFormState("idle"), 3000);
        }
    };

    return (
        <section id="contact" className="py-24 relative overflow-hidden bg-white dark:bg-slate-900">
            {/* Background Decor */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
                        >
                            Get in Touch
                        </motion.h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Have questions or need a custom quote? We&apos;re here to help.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Contact Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.6 }}
                            className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-2xl font-bold mb-8 relative z-10">Contact Information</h3>

                            <div className="space-y-8 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <Mail className="size-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Email Us</p>
                                        <a href="mailto:contact@ddtec.com" className="text-lg font-medium hover:text-teal-400 transition-colors">contact@ddtec.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <Phone className="size-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Call Us</p>
                                        <a href="tel:+919876543210" className="text-lg font-medium hover:text-teal-400 transition-colors">+91 98765 43210</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <MapPin className="size-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">Visit Us</p>
                                        <p className="text-lg font-medium leading-relaxed">
                                            123 Industrial Estate,<br />
                                            Tech City, Innovation Hub
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
                                <p className="text-slate-400 text-sm">
                                    Operating Hours: <br />
                                    Mon - Fri: 9:00 AM - 6:00 PM
                                </p>
                            </div>
                        </motion.div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.6 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                                        <input
                                            required
                                            name="firstName"
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                            defaultValue={user?.firstName || (user?.name ? user.name.split(" ")[0] : "")}
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                                        <input
                                            required
                                            name="lastName"
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                            defaultValue={user?.lastName || (user?.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "")}
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input
                                        required
                                        name="email"
                                        type="email"
                                        defaultValue={user?.email || ""}
                                        readOnly={!!user?.email}
                                        className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${user?.email ? "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-slate-50 dark:bg-slate-900"}`}
                                        placeholder="john@company.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                                    <textarea
                                        required
                                        name="message"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                                        placeholder="Tell us about your requirements..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={formState !== "idle"}
                                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {formState === "idle" && (
                                        <>Send Message <Send className="size-5" /></>
                                    )}
                                    {formState === "submitting" && "Sending..."}
                                    {formState === "success" && (
                                        <>Message Sent! <MessageSquare className="size-5" /></>
                                    )}
                                    {formState === "error" && (
                                        <>Failed. Try Again.</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
