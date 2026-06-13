import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useAllDocumentVersions } from '@/hooks/useDataApi';
import { dataApiClient } from '@/services/data-api';

interface DocumentVersionContextType {
  documentVersionId: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

const DocumentVersionContext = createContext<DocumentVersionContextType | undefined>(undefined);

interface DocumentVersionProviderProps {
  children: React.ReactNode;
  isoCode: string;
}

/**
 * Provider that fetches and manages the active document version for a country.
 * Document versions are needed for Hacienda-related data (taxes, tax rates, etc.)
 * The document version ID is automatically injected into data API calls that need it.
 */
export function DocumentVersionProvider({ children, isoCode }: DocumentVersionProviderProps) {
  const { data: versions, isLoading, isError } = useAllDocumentVersions(
    { iso_code: isoCode, status: '1' }, // Only fetch active versions
    { 
      enabled: !!isoCode,
      staleTime: 60 * 60 * 1000, // 1 hour - document versions don't change often
    }
  );

  // Get the most recent active version
  const documentVersionId = useMemo(() => {
    if (!versions || versions.length === 0) return undefined;
    
    // Sort by version_date descending and get the first one
    const sorted = [...versions].sort((a, b) => {
      const dateA = new Date(a.version_date).getTime();
      const dateB = new Date(b.version_date).getTime();
      return dateB - dateA;
    });
    
    return sorted[0]?.id;
  }, [versions]);

  // Update the data API client with the current document version ID
  useEffect(() => {
    dataApiClient.setDocumentVersionId(documentVersionId);
  }, [documentVersionId]);

  return (
    <DocumentVersionContext.Provider value={{ documentVersionId, isLoading, isError }}>
      {children}
    </DocumentVersionContext.Provider>
  );
}

/**
 * Hook to access the active document version ID for the current organization's country.
 * Returns undefined if not yet loaded or if there's no active version.
 * 
 * Note: You typically don't need to use this hook directly - the document version ID
 * is automatically injected into data API calls that require it.
 */
export function useDocumentVersion() {
  const context = useContext(DocumentVersionContext);
  if (context === undefined) {
    throw new Error('useDocumentVersion must be used within a DocumentVersionProvider');
  }
  return context;
}
