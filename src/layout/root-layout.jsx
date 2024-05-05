import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY } from '../utils/constant';

const PUBLISHABLE_KEY = NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}

export default function RootLayout() {
    const location = useLocation();
    const isSignInPage = location.pathname === '/sign-in';
    const isSignUpPage = location.pathname === '/sign-up';

    return (
        <ClerkProvider
            publishableKey={ PUBLISHABLE_KEY }

        >
            <header className="header text-white pt-1">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">
                            <Link to='/dashboard' className=" text-decoration-none">Evolve-AI</Link>
                        </h4>
                        <div>
                            <SignedOut>
                                <Link to="/sign-in" className={ `btn ${isSignInPage ? 'btn-primary' : 'btn-dark'} me-2` }>Sign In</Link>
                                <Link to='/sign-up' className={ `btn ${isSignUpPage ? 'btn-primary' : 'btn-dark'}` }>Sign Up</Link>
                            </SignedOut>
                            <SignedIn>
                                <UserButton className="btn btn-light" />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </header>
            <hr></hr>
            <main className="container">
                <Outlet />
            </main>
        </ClerkProvider>
    )
}
