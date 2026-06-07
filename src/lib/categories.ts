export const CATEGORY_ICONS: Record<string, string> = {
  limpeza: "cleaning_services",
  eletricista: "electrical_services",
  encanador: "plumbing",
  pintor: "format_paint",
  carpinteiro: "carpenter",
  pedreiro: "construction",
  jardinagem: "yard",
};

export function categoryIcon(name: string): string {
  return CATEGORY_ICONS[name.toLowerCase()] ?? "handyman";
}
