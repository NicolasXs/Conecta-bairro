import { formatDate } from "../../lib/utils";
import type { UserProfile } from "../../types";

type Props = {
  profile: UserProfile;
};

export function AccountSummary({ profile }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-primary border-b border-outline-variant pb-3 mb-4">
          Resumo da conta
        </h3>
        <ul className="space-y-4">
          <li className="flex flex-col gap-1">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
              E-mail de Login
            </span>
            <span className="text-foreground text-sm font-semibold break-all">{profile.email}</span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
              Criado em
            </span>
            <span className="text-foreground text-sm font-semibold">
              {formatDate(profile.createdAt)}
            </span>
          </li>
          <li className="flex flex-col gap-1">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
              Última atualização
            </span>
            <span className="text-foreground text-sm font-semibold">
              {formatDate(profile.updatedAt)}
            </span>
          </li>
        </ul>
      </div>
      <div className="bg-muted/25 border border-outline-variant rounded-2xl p-6 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-2xl select-none">
          shield_lock
        </span>
        <div>
          <h4 className="text-sm font-bold text-primary mb-1">Segurança e Privacidade</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seus dados são transmitidos de forma criptografada para nossos servidores de
            altíssima segurança. Nós respeitamos sua privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
