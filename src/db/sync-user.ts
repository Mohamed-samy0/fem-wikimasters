import db from "@/db/index";
import { usersSync } from "@/db/schema";

type StackUser = {
  id: string;
  displayName?: string | null;
  primaryEmail?: string | null;
  name?: string | null;
  email?: string | null;
};

export async function ensureUserExists(stackUser: StackUser): Promise<void> {
  const name = stackUser.displayName ?? stackUser.name ?? null;
  const email = stackUser.primaryEmail ?? stackUser.email ?? null;
  await db
    .insert(usersSync)
    .values({
      id: stackUser.id,
      name,
      email,
    })
    .onConflictDoUpdate({
      target: usersSync.id,
      set: {
        name,
        email,
      },
    });
}
