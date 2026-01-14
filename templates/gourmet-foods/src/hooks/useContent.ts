import { useQuery } from '@tanstack/react-query';
import { getApiClient } from '../lib/api';
import { useSubdomainContext } from '../contexts/SubdomainContext';

export function useMode() {
  const { config } = useSubdomainContext();
  
  if (config) {
    return {
      mode: config.mode,
      id: config.mode === 'demo' ? config.templateId : config.orgId,
    };
  }
  
  return { mode: null, id: null };
}

export function useIsDemoMode() {
  const { mode } = useMode();
  return mode === 'demo';
}

export function useTheme() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['theme', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getTheme();
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useContact() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['contact', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getContact();
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['categories', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getCategories();
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePages() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['pages', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPages();
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts(filters?: {
  isService?: boolean;
  onSale?: boolean;
  type?: string;
  category?: string;
}) {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['products', mode, id, filters],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getProducts(filters);
    },
    enabled: !!mode && !!id,
    staleTime: 1 * 60 * 1000,
  });
}

export function useHomePage() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['page', 'home', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPage('home');
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAboutPage() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['page', 'about', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPage('about');
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomePageSections() {
  const { data: homePage } = useHomePage();
  return { data: homePage?.sections || [] };
}

export function useProductsPage() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['page', 'products', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPage('products');
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useServicesPage() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['page', 'services', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPage('services');
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProgramsPage() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['page', 'programs', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPage('programs');
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDealsPage() {
  const { mode, id } = useMode();
  
  return useQuery({
    queryKey: ['page', 'deals', mode, id],
    queryFn: () => {
      if (!mode || !id) throw new Error('Mode or ID not available');
      return getApiClient(mode, id).getPage('deals');
    },
    enabled: !!mode && !!id,
    staleTime: 5 * 60 * 1000,
  });
}
