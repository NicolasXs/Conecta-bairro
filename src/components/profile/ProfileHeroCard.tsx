import { StarDisplay } from "../StarDisplay";
import { formatDate } from "../../lib/utils";
import type { UserProfile, Rating } from "../../types";

type Props = {
  profile: UserProfile;
  ratings: Rating[];
  avg: string | null;
  editOpen: boolean;
  onToggleEdit: () => void;
};

export function ProfileHeroCard({ profile, ratings, avg, editOpen, onToggleEdit }: Props) {
  return (
    <div className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      {profile.coverUrl ? (
        <div className="h-32 overflow-hidden">
          <img
            src={profile.coverUrl}
            alt="Capa do perfil"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-linear-to-br from-primary/10 via-secondary/10 to-secondary/20" />
      )}
      <div className="px-6 md:px-8 pb-6">
        {/* Avatar + ações — avatar sobrepõe o cover com -mt-12 */}
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full bg-card border-4 border-card shadow-md flex items-center justify-center shrink-0 overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-secondary text-5xl">person</span>
            )}
          </div>

          <div className="flex items-center gap-3 pb-1">
            {avg && (
              <div className="bg-background border border-outline-variant rounded-2xl px-5 py-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{avg}</p>
                <StarDisplay score={Math.round(parseFloat(avg))} size="sm" />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ratings.length} {ratings.length === 1 ? "avaliação" : "avaliações"}
                </p>
              </div>
            )}
            <button
              onClick={onToggleEdit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold hover:border-secondary hover:text-secondary transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                {editOpen ? "close" : "edit"}
              </span>
              {editOpen ? "Cancelar" : "Editar perfil"}
            </button>
          </div>
        </div>

        {/* Nome e informações — abaixo do cover */}
        <div>
          <h1 className="text-3xl font-bold text-primary">{profile.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-muted-foreground">
            {(profile.bairro || profile.cidade) && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {[profile.bairro, profile.cidade].filter(Boolean).join(", ")}
              </span>
            )}
            {profile.createdAt && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Membro desde {formatDate(profile.createdAt, { month: "long", year: "numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              {profile.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
