export type ViaCepResponse = {
  bairro?: string;
  localidade?: string;
  erro?: boolean;
};

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length <= 5 ? digits : `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function getCepDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export async function fetchViaCep(cepDigits: string): Promise<ViaCepResponse> {
  const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
  if (!response.ok) throw new Error("Falha ao consultar o CEP.");
  const data = (await response.json()) as ViaCepResponse;
  if (data.erro) throw new Error("CEP não encontrado.");
  return data;
}
