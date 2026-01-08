import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { fetchAuthSession } from 'aws-amplify/auth';

async function throwIfResNotOk(res: Response) {
    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }
}

export async function apiRequest(
    method: string,
    url: string,
    data?: unknown | undefined,
): Promise<Response> {
    // Build headers with Content-Type if data is provided
    const headers: Record<string, string> = {};
    if (data) {
        headers["Content-Type"] = "application/json";
    }

    // Add Cognito authentication token
    try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
            headers.Authorization = `Bearer ${idToken}`;
        }
    } catch (error) {
        // No auth session available, continue without token
        console.warn('No auth session available for API request');
    }

    const res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
    on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
    ({ on401: unauthorizedBehavior }) =>
        async ({ queryKey }) => {
            const endpoint = queryKey.join("/") as string;

            try {
                // Build headers with auth token
                const headers: Record<string, string> = {};
                try {
                    const session = await fetchAuthSession();
                    const idToken = session.tokens?.idToken?.toString();
                    if (idToken) {
                        headers.Authorization = `Bearer ${idToken}`;
                    }
                } catch (error) {
                    // No auth session available
                }

                const res = await fetch(endpoint, {
                    credentials: "include",
                    headers,
                });

                if (unauthorizedBehavior === "returnNull" && res.status === 401) {
                    return null;
                }

                await throwIfResNotOk(res);
                return await res.json();
            } catch (error) {
                throw error;
            }
        };

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({ on401: "throw" }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});
