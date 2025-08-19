import {QueryClient, QueryFunction} from "@tanstack/react-query";
import config from './config';
//import { staticDataService } from './static-data';
import {offlineData} from './offlineData';

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
    // Handle static mode requests
    if (config.staticMode) {
        return handleStaticModeRequest(method, url, data);
    }

    const res = await fetch(url, {
        method,
        headers: data ? {"Content-Type": "application/json"} : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
}

async function handleStaticModeRequest(
    method: string,
    url: string,
    data?: unknown
): Promise<Response> {
    // Simulate API responses for static mode
    try {
        let result: any;

        if (url === '/api/products' && method === 'GET') {
            result = await offlineData.getProducts();
        } else if (url.startsWith('/api/products/') && method === 'GET') {
            let categories = await offlineData.getCategories();

            const categorySlug = url.split('/').pop();

            const categoryId = categories.find((category: { slug: string; }) => category.slug === categorySlug)?.id;


            result = await offlineData.getProductsByCategory(categoryId!);
        } else if (url === '/api/categories' && method === 'GET') {
            result = await offlineData.getCategories();
        } else if (url === '/api/home-content' && method === 'GET') {
            result = await offlineData.getCMSContent();
        } else {
            throw new Error('Not found');
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
    } catch (error) {
        return new Response(JSON.stringify({message: (error as Error).message}), {
            status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400,
            headers: {'Content-Type': 'application/json'}
        });
    }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
    on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
    ({on401: unauthorizedBehavior}) =>
        async ({queryKey}) => {
            const endpoint = queryKey.join("/") as string;

            try {
                const res = await fetch(endpoint, {
                    credentials: "include",
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
            queryFn: getQueryFn({on401: "throw"}),
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
