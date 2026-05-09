interface TickerProps {
  items: string[];
}

export function Ticker({ items }: TickerProps) {
  const seq = [...items, ...items];
  return (
    <div className="border-y border-border bg-card/50 overflow-hidden">
      <div className="flex gap-10 ticker-track py-3 whitespace-nowrap">
        {seq.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-[13px] font-display font-bold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
