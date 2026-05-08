import { useState } from "react";
import { crossAppApi, crossAppOrgPath } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/store/inventory";
import type { Product } from "@/types";
import { Icon, Card, Badge, Button } from "@/components/ui";
import { ProductImage } from "@/components/ui/ProductImage";
import { useLanguage } from "@/contexts/LanguageContext";

const fmt = (n: number) => "₡" + Math.round(n).toLocaleString("es-CR");
const fmtTime = (d: number) => new Date(d).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });

interface ClosingFlowProps {
  assignmentId: string;
  sessionId: string;
  expectedCash: number;
  expectedSinpe: number;
  expectedCard: number;
  onClose: () => void;
}

const DENOMS = [
  { key: "b20000", value: 20000, labelKey: "closing.bill20k" },
  { key: "b10000", value: 10000, labelKey: "closing.bill10k" },
  { key: "b5000", value: 5000, labelKey: "closing.bill5k" },
  { key: "b2000", value: 2000, labelKey: "closing.bill2k" },
  { key: "b1000", value: 1000, labelKey: "closing.bill1k" },
  { key: "c500", value: 500, labelKey: "closing.coin500" },
  { key: "c100", value: 100, labelKey: "closing.coin100" },
] as const;

type DenomKey = typeof DENOMS[number]["key"];

export default function ClosingFlow({
  assignmentId,
  sessionId,
  expectedCash,
  onClose,
}: ClosingFlowProps) {
  const { user } = useAuthContext();
  const { useDefaultOrganization } = useOrganization();
  const { data: org } = useDefaultOrganization(user?.userId);
  const { data: rawProducts } = useProducts();
  const { t } = useLanguage();
  const products: Product[] = Array.isArray(rawProducts)
    ? rawProducts
    : (rawProducts as any)?.data ?? [];
  const inventory = useInventory();

  const [step, setStep] = useState(1);
  const [finalCounts, setFinalCounts] = useState<Record<string, string>>({});
  const [cashCount, setCashCount] = useState<Record<DenomKey, string>>({
    b20000: "", b10000: "", b5000: "", b2000: "", b1000: "", c500: "", c100: "",
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const activeProducts = products.filter((p) => p.status === 1);
  const filledCount = Object.values(finalCounts).filter((v) => v !== "").length;

  const cashTotal = DENOMS.reduce(
    (s, d) => s + (Number(cashCount[d.key]) || 0) * d.value,
    0,
  );
  const cashDiff = cashTotal - expectedCash;

  const getExpected = (p: Product) => inventory.getStock(p.product_id) ?? 0;

  const faltantes = activeProducts.filter((p) => {
    const actual = Number(finalCounts[p.product_id]) || 0;
    const exp = getExpected(p);
    return finalCounts[p.product_id] !== "" && actual < exp;
  });

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await crossAppApi.post(crossAppOrgPath(org!.id, "/closings"), {
        session_id: sessionId,
        assignment_id: assignmentId,
        declared_cash: cashTotal,
        declared_sinpe: 0,
        declared_card: 0,
        declared_total: cashTotal,
        notes: notes || undefined,
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        style={{
          maxWidth: 440,
          margin: "0 auto",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          textAlign: "center",
          background: "hsl(var(--background))",
          gap: 20,
        }}
      >
        <div
          className="icon-pill icon-pill-lg"
          style={{
            width: 72,
            height: 72,
            background: "hsl(var(--success) / 0.15)",
            color: "hsl(var(--success))",
          }}
        >
          <Icon name="checkCircle" size={32} />
        </div>
        <h2 className="t-h2">{t("closing.closeSent")}</h2>
        <p className="t-body" style={{ color: "hsl(var(--muted-foreground))" }}>
          {t("closing.managerWillReview")}
        </p>
        <Button variant="primary" size="xl" onClick={onClose} style={{ width: "100%" }}>
          {t("common.close")}
        </Button>
      </div>
    );
  }

  const stepLabels = [t("closing.stepInventory"), t("closing.stepCash"), t("closing.stepSummary")];

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--background))",
      }}
    >
      {/* Nav bar */}
      <div
        className="nav-bar"
        style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}
      >
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={onClose}
          aria-label={t("closing.back")}
        >
          <Icon name="arrowLeft" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="t-label" style={{ fontSize: 10 }}>
            {t("closing.title")}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {t("closing.step", { n: String(step), total: "3" })}
          </div>
        </div>
        <Badge variant="warning">
          <Icon name="lock" size={10} /> {t("closing.closingLabel")}
        </Badge>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background:
                  n <= step ? "hsl(var(--primary))" : "hsl(var(--muted))",
                transition: "background .3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {stepLabels.map((label, i) => (
            <div
              key={label}
              className="t-xs"
              style={{
                color:
                  i + 1 >= step
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                fontWeight: i + 1 === step ? 700 : 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "14px 16px 100px", overflowY: "auto" }}>
        {/* Step 1: Inventory count */}
        {step === 1 && (
          <>
            <Card
              style={{
                padding: 14,
                marginBottom: 14,
                background: "hsl(var(--info) / 0.08)",
                borderColor: "hsl(var(--info) / 0.3)",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <Icon
                  name="info"
                  size={18}
                  style={{ color: "hsl(var(--info))", flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: "hsl(var(--info))" }}
                  >
                    {t("closing.countRemaining")}
                  </div>
                  <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {t("closing.systemCompares")}
                  </div>
                </div>
              </div>
            </Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeProducts.map((p) => {
                const val = finalCounts[p.product_id] ?? "";
                const actual = Number(val) || 0;
                const exp = getExpected(p);
                const diff = actual - exp;
                const hasValue = val !== "" && val !== null;
                const isMatch = hasValue && diff === 0;
                const isMissing = hasValue && diff < 0;
                return (
                  <Card
                    key={p.product_id}
                    style={{
                      padding: 12,
                      borderColor: isMatch
                        ? "hsl(var(--success) / 0.4)"
                        : isMissing
                        ? "hsl(var(--destructive) / 0.4)"
                        : "hsl(var(--border))",
                      transition: "border-color .2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <ProductImage imageUrl={p.image_url} name={p.name} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {t("closing.expectedRemaining")}{" "}
                          <strong className="t-num" style={{ color: "hsl(var(--foreground))" }}>
                            {exp}
                          </strong>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <input
                          className="t-num"
                          type="number"
                          value={val}
                          onChange={(e) =>
                            setFinalCounts((c) => ({ ...c, [p.product_id]: e.target.value }))
                          }
                          style={{
                            width: 60,
                            textAlign: "center",
                            fontSize: 18,
                            fontWeight: 800,
                            background: "hsl(var(--muted))",
                            border: "none",
                            outline: "none",
                            borderRadius: 8,
                            padding: "8px 0",
                            fontFamily: "var(--font-display)",
                          }}
                          placeholder="0"
                        />
                        {hasValue && (
                          <div
                            className="t-xs t-num"
                            style={{
                              color:
                                diff === 0
                                  ? "hsl(var(--success))"
                                  : diff > 0
                                  ? "hsl(var(--warning))"
                                  : "hsl(var(--destructive))",
                              fontWeight: 700,
                              marginTop: 2,
                            }}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Step 2: Cash breakdown */}
        {step === 2 && (
          <>
            <Card style={{ padding: 16, marginBottom: 14 }}>
              <div className="t-label" style={{ marginBottom: 6 }}>
                {t("closing.totalExpected")}
              </div>
              <div className="t-stat-xl" style={{ fontSize: 36 }}>
                {fmt(expectedCash)}
              </div>
              <div
                className="t-xs"
                style={{ color: "hsl(var(--muted-foreground))", marginTop: 4 }}
              >
                {t("closing.initialFundSales")}
              </div>
            </Card>

            <div className="t-label" style={{ marginBottom: 10 }}>
              {t("closing.cashBreakdown")}
            </div>
            <Card style={{ padding: 12 }}>
              {DENOMS.map((denom, i) => {
                const qty = Number(cashCount[denom.key]) || 0;
                return (
                  <div
                    key={denom.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom:
                        i < DENOMS.length - 1 ? "1px solid hsl(var(--border))" : "none",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t(denom.labelKey)}</div>
                      <div className="t-xs t-num" style={{ color: "hsl(var(--muted-foreground))" }}>
                        × {fmt(denom.value)}
                      </div>
                    </div>
                    <input
                      className="pp-input t-num"
                      type="number"
                      value={cashCount[denom.key]}
                      onChange={(e) =>
                        setCashCount((c) => ({ ...c, [denom.key]: e.target.value }))
                      }
                      style={{
                        width: 70,
                        textAlign: "center",
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                      }}
                      placeholder="0"
                    />
                    <div
                      className="t-num"
                      style={{
                        width: 86,
                        textAlign: "right",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {qty * denom.value > 0 ? fmt(qty * denom.value) : "—"}
                    </div>
                  </div>
                );
              })}
            </Card>

            <Card
              style={{
                padding: 14,
                marginTop: 14,
                background:
                  cashDiff === 0
                    ? "hsl(var(--success) / 0.08)"
                    : Math.abs(cashDiff) < 1000
                    ? "hsl(var(--warning) / 0.08)"
                    : "hsl(var(--destructive) / 0.08)",
                borderColor:
                  cashDiff === 0
                    ? "hsl(var(--success) / 0.3)"
                    : Math.abs(cashDiff) < 1000
                    ? "hsl(var(--warning) / 0.3)"
                    : "hsl(var(--destructive) / 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "hsl(var(--muted-foreground))" }}>{t("closing.counted")}</span>
                <span className="t-num" style={{ fontWeight: 700 }}>
                  {fmt(cashTotal)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: "hsl(var(--muted-foreground))" }}>{t("closing.expected")}</span>
                <span className="t-num" style={{ fontWeight: 700 }}>
                  {fmt(expectedCash)}
                </span>
              </div>
              <div className="separator" style={{ marginBottom: 10 }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="t-label">
                  {cashDiff > 0 ? t("closing.surplus") : cashDiff < 0 ? t("closing.shortage") : t("closing.difference")}
                </span>
                <span
                  className="t-stat"
                  style={{
                    fontSize: 24,
                    color:
                      cashDiff === 0
                        ? "hsl(var(--success))"
                        : Math.abs(cashDiff) < 1000
                        ? "hsl(var(--warning))"
                        : "hsl(var(--destructive))",
                  }}
                >
                  {cashDiff >= 0 ? "+" : "−"}
                  {fmt(Math.abs(cashDiff))}
                </span>
              </div>
            </Card>
          </>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <>
            <Card
              style={{
                padding: 18,
                marginBottom: 14,
                background:
                  "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))",
                borderColor: "hsl(var(--primary) / 0.3)",
              }}
            >
              <div className="t-label" style={{ color: "hsl(var(--primary))", marginBottom: 6 }}>
                {t("closing.shiftStation")}
              </div>
              <div className="t-h3" style={{ marginBottom: 4 }}>
                {t("closing.finalSummary")}
              </div>
              <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {user?.name ?? t("closing.cashier")} · 19:00 → {fmtTime(Date.now())}
              </div>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <Card style={{ padding: 14 }}>
                <div className="t-label">{t("closing.sales")}</div>
                <div className="t-stat" style={{ fontSize: 22, color: "hsl(var(--success))" }}>
                  —
                </div>
                <div className="t-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t("closing.shiftOrders")}
                </div>
              </Card>
              <Card style={{ padding: 14 }}>
                <div className="t-label">{t("closing.cashLabel")}</div>
                <div className="t-stat" style={{ fontSize: 22 }}>
                  {fmt(cashTotal)}
                </div>
                <div
                  className="t-xs t-num"
                  style={{
                    color:
                      cashDiff >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))",
                  }}
                >
                  {cashDiff >= 0 ? "+" : "−"}
                  {fmt(Math.abs(cashDiff))}
                </div>
              </Card>
            </div>

            <Card style={{ padding: 16, marginBottom: 14 }}>
              <div className="t-label" style={{ marginBottom: 10 }}>
                {t("closing.productShortages")}
              </div>
              {faltantes.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                  }}
                >
                  <Icon name="checkCircle" size={18} style={{ color: "hsl(var(--success))" }} />
                  <span className="t-sm" style={{ fontWeight: 600 }}>
                    {t("closing.allBalanced")}
                  </span>
                </div>
              ) : (
                faltantes.map((p) => {
                  const exp = getExpected(p);
                  const actual = Number(finalCounts[p.product_id]) || 0;
                  return (
                    <div
                      key={p.product_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                        borderBottom: "1px solid hsl(var(--border))",
                      }}
                    >
                      <ProductImage imageUrl={p.image_url} name={p.name} size={18} style={{ borderRadius: 4 }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      <Badge variant="destructive">−{exp - actual}</Badge>
                    </div>
                  );
                })
              )}
            </Card>

            <Card style={{ padding: 14 }}>
              <div className="t-label" style={{ marginBottom: 8 }}>
                {t("closing.notes")}
              </div>
              <textarea
                className="pp-input"
                placeholder={t("closing.notesPlaceholder")}
                style={{ minHeight: 70 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Card>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "hsl(var(--background) / 0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid hsl(var(--border))",
          padding: "12px 16px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            margin: "0 auto",
            display: "flex",
            gap: 8,
          }}
        >
          {step > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep((s) => s - 1)}
              style={{ flex: 0.8 }}
            >
              <Icon name="arrowLeft" size={16} /> {t("closing.back")}
            </Button>
          )}
          {step < 3 ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && filledCount < activeProducts.length}
              style={{ flex: 1 }}
            >
              {t("closing.continue")} <Icon name="arrowRight" size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1 }}
            >
              <Icon name="check" size={16} />{" "}
              {loading ? t("closing.sending") : t("closing.closeShift")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
