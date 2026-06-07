type Props = {
  servicesCount: number;
  ratingsCount: number;
  avg: string | null;
  cep?: string | null;
};

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-card border border-outline-variant rounded-2xl p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

export function ProfileStats({ servicesCount, ratingsCount, avg, cep }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard value={servicesCount} label="Serviços" />
      <StatCard value={ratingsCount} label="Avaliações" />
      <StatCard value={avg ?? "—"} label="Média" />
      <StatCard value={cep || "—"} label="CEP" />
    </div>
  );
}
