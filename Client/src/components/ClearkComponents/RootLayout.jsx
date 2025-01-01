import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from './Constant';

const PUBLISHABLE_KEY = NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}

export default function RootLayout() {
    return (

        <Outlet />

    );
}
