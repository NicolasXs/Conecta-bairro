type StarDisplayProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

export function StarDisplay({ score, size = "md" }: StarDisplayProps) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined select-none ${
            star <= score ? "text-yellow-400" : "text-muted-foreground/30"
          }`}
          style={{ fontVariationSettings: `'FILL' ${star <= score ? 1 : 0}` }}
        >
          star
        </span>
      ))}
    </div>
  );
}
