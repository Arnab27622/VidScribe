import { LoginModal } from "@/components/LoginModal";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - VidScribe",
    description: "Sign in to access your YouTube video summaries.",
};

export default function LoginPage() {
    return (
        <main className="h-dvh bg-background overflow-hidden">
            <LoginModal />
        </main>
    );
}
