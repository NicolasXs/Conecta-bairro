import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PageLayout } from "../components/PageLayout";
import { apiRequest } from "../lib/api";
import { averageScore } from "../lib/utils";
import { getAuthenticatedUserId } from "../lib/auth";
import { requireAuth } from "../lib/guards";
import type { UserProfile, Rating, Service, Category, ContactLink } from "../types";

import { ProfileHeroCard } from "../components/profile/ProfileHeroCard";
import { ProfileStats } from "../components/profile/ProfileStats";
import { ContactLinksSection } from "../components/profile/ContactLinksSection";
import { ProfileEditForm } from "../components/profile/ProfileEditForm";
import { ServicesSection } from "../components/profile/ServicesSection";
import { RatingsSection } from "../components/profile/RatingsSection";
import { AccountSummary } from "../components/profile/AccountSummary";
import { ExternalLinkModal } from "../components/profile/ExternalLinkModal";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  component: ProfilePage,
});

function ProfilePage() {
  const userId = getAuthenticatedUserId();

  const [editOpen, setEditOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<ContactLink | null>(null);

  const profileQuery = useQuery<UserProfile>({
    queryKey: ["user-profile", userId],
    enabled: Boolean(userId),
    queryFn: () => apiRequest<UserProfile>(`/users/${userId}`),
  });

  const ratingsQuery = useQuery<Rating[]>({
    queryKey: ["ratings", userId],
    enabled: Boolean(userId),
    queryFn: () => apiRequest<Rating[]>(`/ratings/${userId}`),
  });

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["services", { workerId: userId }],
    enabled: Boolean(userId),
    queryFn: () => apiRequest<Service[]>(`/users/${encodeURIComponent(userId ?? "")}/services`),
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiRequest<Category[]>("/categories"),
    staleTime: 1000 * 60 * 10,
  });

  const ratings = ratingsQuery.data ?? [];
  const avg = averageScore(ratings);
  const myServices = servicesQuery.data ?? [];
  const profile = profileQuery.data;

  return (
    <PageLayout mainClassName="py-12">
      <div className="max-w-300 mx-auto px-6">
        {profileQuery.isLoading && <ProfileLoadingSkeleton />}

        {profileQuery.isError && (
          <div className="bg-card border border-outline-variant rounded-xl p-6">
            <p className="text-destructive font-medium mb-4">Erro ao carregar seu perfil.</p>
            <button
              type="button"
              onClick={() => profileQuery.refetch()}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {profile && (
          <div className="space-y-8">
            <ProfileHeroCard
              profile={profile}
              ratings={ratings}
              avg={avg}
              editOpen={editOpen}
              onToggleEdit={() => setEditOpen((v) => !v)}
            />
            <ProfileStats
              servicesCount={myServices.length}
              ratingsCount={ratings.length}
              avg={avg}
              cep={profile.cep}
            />
            <ContactLinksSection
              contactLinks={profile.contactLinks ?? []}
              onLinkClick={setPendingLink}
            />
            {editOpen && <ProfileEditForm profile={profile} userId={userId!} />}
            <ServicesSection
              services={myServices}
              servicesLoading={servicesQuery.isLoading}
              categories={categoriesQuery.data ?? []}
              userId={userId!}
              defaultBairro={profile.bairro ?? ""}
            />
            <RatingsSection ratings={ratings} isLoading={ratingsQuery.isLoading} />
            <AccountSummary profile={profile} />
          </div>
        )}
      </div>

      {pendingLink && (
        <ExternalLinkModal link={pendingLink} onClose={() => setPendingLink(null)} />
      )}
    </PageLayout>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-card border border-outline-variant rounded-2xl overflow-hidden">
        <div className="h-32 bg-muted" />
        <div className="px-8 pb-6 -mt-10 flex gap-5 items-end">
          <div className="w-24 h-24 rounded-full bg-muted shrink-0" />
          <div className="space-y-3 flex-1 mb-2">
            <div className="h-7 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
