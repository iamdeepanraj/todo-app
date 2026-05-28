import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
})

export const { useSession } = authClient

export const signIn = async () => {
    const data = await authClient.signIn.social({
        provider: "google",
    });
};

export const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/login";
};