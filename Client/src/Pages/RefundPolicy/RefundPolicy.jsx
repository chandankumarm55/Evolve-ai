import React from 'react';
import { useTheme } from "../../contexts/ThemeContext";
import { Card, CardContent } from "../../components/ui/card";
import Header from '../../components/FunctionalComponents/Header';
import Footer from '../../components/FunctionalComponents/Footer';

const RefundPolicy = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div>
                    <CardContent className="p-6 space-y-4">
                        <h1 className="text-3xl font-bold">Refund & Cancellation Policy</h1>
                        <p>Due to the nature of our services, Evolve AI does not offer refunds or cancellations once a payment has been processed.</p>

                        <h2 className="text-xl font-semibold">1. No Refunds</h2>
                        <p>All payments are final. We do not provide refunds for any reason, including but not limited to dissatisfaction with the service, accidental purchases, or unused subscription periods.</p>

                        <h2 className="text-xl font-semibold">2. Cancellation</h2>
                        <p>You may cancel your subscription at any time, but no refunds will be issued for the remaining period of the subscription. Your access to premium features will remain active until the end of the billing cycle.</p>

                        <h2 className="text-xl font-semibold">3. Exceptional Cases</h2>
                        <p>In rare cases, such as duplicate transactions or technical issues caused by Evolve AI, a refund may be issued upon thorough review. Please contact our support team for assistance.</p>
                    </CardContent>
                </div>
            </div >
            <Footer />
        </>
    );
};

export default RefundPolicy;
