import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { useSession } from "@/hooks/use-session";

/** Small header control: sign in, or the signed-in reader with a way out. */
export function AccountNav() {
  const { user, ready } = useSession();

  if (!ready) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
      >
        <UserRound className="size-4" /> Sign in
      </Link>
    );
  }

  return (
    <Link
      to="/account"
      title={user.email ?? undefined}
      className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
    >
      <UserRound className="size-4" /> Account
    </Link>
  );
}
