import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { useHacienda } from "@/hooks/useHacienda";

interface CabysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (cabys: { codigo: string; descripcion: string; impuesto: number }) => void;
}

export function CabysModal({ isOpen, onClose, onSelect }: CabysModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { searchCabysByName } = useHacienda();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await searchCabysByName(searchTerm, 20);
      setResults(data);
    } catch (error) {
      console.error('Error searching CABYS:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (cabys: any) => {
    onSelect({
      codigo: cabys.codigo,
      descripcion: cabys.descripcion,
      impuesto: cabys.impuesto
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((cabys) => (
                <div
                  key={cabys.codigo}
                  className="p-4 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelect(cabys)}
                >
                  <div className="flex flex-col h-full">
                    <div className="font-medium text-lg">{cabys.codigo}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {cabys.descripcion}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      IVA: {cabys.impuesto}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      </DialogContent>
    </Dialog>
  );
}
