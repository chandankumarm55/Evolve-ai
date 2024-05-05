import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
    return (
        <div className="d-flex justify-content-center align-items-center vh-50 mt-4">
            <div className="text-center">
                <SignIn path="/sign-in" />
            </div>
        </div>
    );
}
