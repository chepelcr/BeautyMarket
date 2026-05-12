interface CopiesTabProps {
  emails: string[];
  onChange: (emails: string[]) => void;
}

export function CopiesTab({ emails, onChange }: CopiesTabProps) {
  const add = () => onChange([...emails, '']);
  const remove = (i: number) => onChange(emails.filter((_, idx) => idx !== i));
  const update = (i: number, v: string) =>
    onChange(emails.map((e, idx) => (idx === i ? v : e)));

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted-foreground">
        El documento se enviará automáticamente al receptor. Agrega correos adicionales para enviar copias.
      </p>

      {emails.map((email, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => update(i, e.target.value)}
            placeholder="copia@ejemplo.com"
            className="flex-1 h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => remove(i)}
            className="h-10 w-10 rounded-md border border-border bg-card text-muted-foreground hover:text-destructive hover:border-destructive/40 flex items-center justify-center"
          >
            🗑
          </button>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full h-9 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        + Agregar copia
      </button>
    </div>
  );
}
