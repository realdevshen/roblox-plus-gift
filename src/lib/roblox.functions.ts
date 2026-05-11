import { createServerFn } from "@tanstack/react-start";

export const lookupRobloxUser = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string }) => {
    if (!data || typeof data.username !== "string") {
      throw new Error("username required");
    }
    return { username: data.username.trim().replace(/^@/, "") };
  })
  .handler(async ({ data }) => {
    if (!data.username) return { found: false as const };

    try {
      const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [data.username],
          excludeBannedUsers: false,
        }),
      });

      if (!userRes.ok) return { found: false as const, error: "Lookup failed" };
      const userJson = (await userRes.json()) as {
        data?: { id: number; name: string; displayName: string }[];
      };
      const user = userJson.data?.[0];
      if (!user) return { found: false as const };

      let avatarUrl: string | null = null;
      try {
        const thumbRes = await fetch(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=true`,
        );
        if (thumbRes.ok) {
          const thumbJson = (await thumbRes.json()) as {
            data?: { imageUrl: string; state: string }[];
          };
          avatarUrl = thumbJson.data?.[0]?.imageUrl ?? null;
        }
      } catch {
        // ignore thumbnail failure
      }

      return {
        found: true as const,
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        avatarUrl,
      };
    } catch (err) {
      console.error("Roblox lookup error:", err);
      return { found: false as const, error: "Network error" };
    }
  });
