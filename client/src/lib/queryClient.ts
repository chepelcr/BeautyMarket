import { QueryClient, QueryFunction } from "@tanstack/react-query";
import config from './config';
import { staticDataService } from './static-data';

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
    headers: data ? { "Content-Type": "application/json" } : {},
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
    
    if (url === '/api/login' && method === 'POST') {
      const { username, password } = data as any;
      const user = await staticDataService.login(username, password);
      if (user) {
        result = user;
      } else {
        throw new Error('Invalid username or password');
      }
    } else if (url === '/api/logout' && method === 'POST') {
      await staticDataService.logout();
      result = { success: true };
    } else if (url === '/api/user' && method === 'GET') {
      result = await staticDataService.getCurrentUser();
      if (!result) {
        throw new Error('Unauthorized');
      }
    } else if (url === '/api/products' && method === 'GET') {
      result = await staticDataService.getProducts();
    } else if (url.startsWith('/api/products/') && method === 'GET') {
      const category = url.split('/').pop();
      result = await staticDataService.getProductsByCategory(category!);
    } else if (url === '/api/products' && method === 'POST') {
      result = await staticDataService.createProduct(data as any);
    } else if (url === '/api/orders' && method === 'POST') {
      result = await staticDataService.createOrder(data as any);
    } else {
      throw new Error('Not found');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
