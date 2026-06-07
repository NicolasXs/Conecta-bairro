import { useState, useCallback } from "react";

type LocationData = {
  bairro: string;
  cidade: string;
  cep: string;
};

export type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: LocationData }
  | { status: "error"; message: string };

async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt-BR`;
  const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
  if (!res.ok) throw new Error("Falha ao obter endereço");
  const json = await res.json();
  const addr = (json.address ?? {}) as Record<string, string>;
  return {
    bairro: addr.neighbourhood ?? addr.suburb ?? addr.quarter ?? addr.village ?? "",
    cidade: addr.city ?? addr.town ?? addr.municipality ?? addr.county ?? "",
    cep: (addr.postcode ?? "").replace(/\D/g, ""),
  };
}

const GEO_ERRORS: Record<number, string> = {
  1: "Permissão de localização negada. Verifique as configurações do navegador.",
  2: "Posição indisponível. Verifique sua conexão.",
  3: "Tempo esgotado ao obter localização.",
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocalização não suportada neste navegador." });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setState({ status: "success", data });
        } catch {
          setState({ status: "error", message: "Não foi possível converter a localização em endereço." });
        }
      },
      (err) => {
        setState({
          status: "error",
          message: GEO_ERRORS[err.code] ?? "Erro ao obter localização.",
        });
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, requestLocation, reset };
}
