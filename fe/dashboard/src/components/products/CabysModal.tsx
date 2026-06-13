import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useHacienda } from "@/hooks/useHacienda";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";

interface CabysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cabys: { codigo: string; descripcion: string; impuesto: number }) => void;
  initialSearchTerm?: string;
  productTypeId?: number;
}

export function CabysModal({ isOpen, onClose, onSelect, initialSearchTerm = "", productTypeId }: CabysModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 20;
  
  const { searchCabys } = useHacienda();
  const { user } = useAuth();
  const { useDefaultOrganization } = useOrganization();
  const { data: defaultOrg } = useDefaultOrganization(user?.id);
  
  const isoCode = defaultOrg?.iso_code || "188";

  // Update search term when modal opens with initial value and trigger search
  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialSearchTerm);
      setCurrentPage(1);
      if (initialSearchTerm.trim()) {
        // Trigger search automatically if there's an initial search term
        handleSearchWithTerm(initialSearchTerm, 1);
      } else {
        setResults([]);
        setTotalPages(1);
        setTotalResults(0);
      }
    }
  }, [isOpen, initialSearchTerm]);

  const handleSearchWithTerm = async (term: string, page: number = 1) => {
    if (!term.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await searchCabys(isoCode, term, page, pageSize, productTypeId);
      setResults(response.items);
      setTotalResults(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching CABYS:', error);
      setResults([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await handleSearchWithTerm(searchTerm, 1);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || isLoading) return;
    await handleSearchWithTerm(searchTerm, newPage);
  };

  const handleSelect = (cabys: any) => {
    onSelect({
      codigo: cabys.code,
      descripcion: cabys.description,
      impuesto: cabys.tax_rate?.percentage || 0
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Código CABYS
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o código"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              Buscar
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {isLoading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalResults)} de {totalResults} resultados
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((cabys) => (
                  <div
                    key={cabys.code}
                    className="p-4 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelect(cabys)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="font-medium text-lg">{cabys.code}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {cabys.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        IVA: {cabys.tax_rate?.percentage || 0}%
                      </div>
                      {cabys.product_type && (
                        <div className="text-xs text-muted-foreground">
                          Tipo: {cabys.product_type.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : searchTerm.trim() ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron resultados
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Ingrese un término de búsqueda
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
