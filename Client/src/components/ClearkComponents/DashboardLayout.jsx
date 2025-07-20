import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Outlet, useNavigate } from 'react-router-dom';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from './Constant';
import Loading from '../FunctionalComponents/Loading';

const PUBLISHABLE_KEY = NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export default function DashboardLayout() {
    const { userId, isLoaded } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !userId) {

            navigate("/sign-up");
        }
    }, [isLoaded, userId, navigate]);

    if (!isLoaded) return <Loading />;

    return (

        <Outlet />


    );
}
