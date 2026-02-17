"use client";

interface TrafficSourceProps {
    source: string;
    percentage: number;
    trend: number[];
    color: string;
}

export default function TrafficSource() {
    const sources = [
        { name: "Google", percentage: 27, trend: [10, 15, 12, 18, 20, 25, 22], color: "stroke-teal-500" },
        { name: "Direct", percentage: 23, trend: [20, 18, 15, 12, 18, 20, 15], color: "stroke-red-500" },
        { name: "Social Media", percentage: 18, trend: [15, 15, 15, 15, 15, 15, 15], color: "stroke-yellow-500" },
        { name: "Referral", percentage: 10, trend: [5, 8, 10, 12, 15, 18, 20], color: "stroke-teal-500" },
        { name: "Email", percentage: 8, trend: [25, 20, 18, 15, 12, 10, 8], color: "stroke-red-500" },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Traffic Source</h3>
            <div className="space-y-6">
                {sources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div className="w-24">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">{source.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{source.percentage}%</span>
                            </div>
                        </div>

                        {/* Mini Chart SVG */}
                        <svg className="w-24 h-10 overflow-visible" viewBox="0 0 60 20">
                            <polyline
                                fill="none"
                                strokeWidth="2"
                                className={source.color}
                                points={source.trend.map((val, i) => `${i * 10},${25 - val}`).join(" ")}
                            />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
}
