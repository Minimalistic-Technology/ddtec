"use client";

interface StockLevelProps {
    stockStats?: {
        totalStock: number;
        lowStock: number;
        outOfStock: number;
    };
    products: Array<{
        name: string;
        stock: number;
        totalSold: number;
    }>;
}

export default function StockLevel({ stockStats, products }: StockLevelProps) {
    const COLORS = ["bg-teal-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-pink-500"];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stock Level</h3>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300">Top Items</span>
            </div>

            <div className="mb-8 shrink-0">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-xs text-slate-400">Total Stock</span>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {stockStats?.totalStock.toLocaleString() || 0}
                            <span className="text-sm text-slate-400 font-normal ml-2">items</span>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${(stockStats?.lowStock || 0) > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {(stockStats?.lowStock || 0) > 0 ? `${stockStats?.lowStock} Low Stock` : 'Healthy'}
                    </span>
                </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {products && products.length > 0 ? (
                    products.map((product, index) => {
                        // Estimate "total capacity" as current stock + sold, or just double stock if sold is 0 to show some bar
                        const total = product.stock + product.totalSold;
                        const percentage = total > 0 ? (product.stock / total) * 100 : 0;

                        return (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-2/3">{product.name}</span>
                                    <span className={`text-xs ${product.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-400 text-sm py-4">No product data available</div>
                )}
            </div>
        </div>
    );
}
