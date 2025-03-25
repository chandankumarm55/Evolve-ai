const BackendUrl =
    import.meta.env.VITE_BACKEND_URL;

export const LoginRouteUrl = `${BackendUrl}/api/user/login`;
export const SubscriptionUpdateUrl = `${BackendUrl}/api/subscription/update`;
export const UsageTrackUrl = `${BackendUrl}/api/usage/track`;
export const CodeWritingUrl = `${BackendUrl}/api/codewriter`;