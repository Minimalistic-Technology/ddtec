import { Suspense } from "react";
import ShopSection from "../_components/ShopSection";

export default function ShopPage() {
    return (
        <div className="pt-20">
            <Suspense fallback={<div>Loading tools...</div>}>
                <ShopSection />
            </Suspense>
        </div>
    );
}
