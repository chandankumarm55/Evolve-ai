import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
    return (
        <div className="d-flex justify-content-center align-items-center vh-50 mt-4">
            <div className="text-center">
                <SignUp path="/sign-up" />
            </div>
        </div>
    );
}
