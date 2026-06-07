export type ContactLink = {
  label: string;
  value: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  description?: string | null;
  contactLinks?: ContactLink[];
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type WorkerProfile = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  description?: string | null;
  contactLinks?: ContactLink[];
  avgScore?: number | null;
  ratingCount?: number;
  serviceCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Rating = {
  id: string;
  workerId?: string;
  clientId?: string;
  clientName?: string | null;
  score: number;
  comment?: string | null;
  createdAt?: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  bairro: string;
  price?: number | null;
  workerId?: string;
  workerName?: string;
  avgScore?: number | null;
  ratingCount?: number;
  createdAt?: string;
};
