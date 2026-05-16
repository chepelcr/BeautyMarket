import { Icon } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PayMethod } from "@/hooks/useCartFlow";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");

interface SaleSuccessOverlayProps {
  total: number;
  change: number;
  method: PayMethod;
  orderNum: number;
  onNewSale: () => void;
}

export function SaleSuccessOverlay({ total, change, method, orderNum, onNewSale }: SaleSuccessOverlayProps) {
  const { t } = useLanguage();

  const methodLabel = method === "cash" ? "Efectivo" : method === "card" ? "Tarjeta" : "SINPE";

  return (
    <div className="h-full min-h-[60vh] bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-[360px]">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6 border-2 border-success/40">
          <Icon name="check" size={36} className="text-success" strokeWidth={3} />
        </div>

        <div className="font-display text-[32px] font-semibold text-foreground mb-2">
          {t("pos.saleRegistered")}
        </div>
        <div className="text-sm text-muted-foreground mb-6">
          Orden #{orderNum} · {fmt(total)} · {methodLabel}
        </div>

        {method === "cash" && change > 0 && (
          <div className="bg-success/10 border border-success/30 rounded-xl px-5 py-4 mb-6">
            <div className="text-xs text-success mb-1">{t("pos.deliverChange")}</div>
            <div className="font-display text-[40px] font-bold text-success">
              {fmt(change)}
            </div>
          </div>
        )}

        <button
          onClick={onNewSale}
          className="w-full py-3.5 bg-accent-rose text-background border-0 rounded-xl text-[15px] font-bold cursor-pointer"
        >
          {t("pos.newSale")}
        </button>
      </div>
    </div>
  );
}
