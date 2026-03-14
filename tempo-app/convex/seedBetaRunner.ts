"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { randomBytes, pbkdf2Sync } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const saltHex = salt.toString("hex");
  const hashHex = hash.toString("hex");
  return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const email = `beta${i}@tempo.app`;
      const password = `beta${i}pass`;
      const name = `Beta User ${i}`;

      try {
        const existingUserId = await ctx.runQuery(
          internal.seedBetaAccounts.findUserByEmail,
          { email }
        );

        if (existingUserId) {
          await ctx.runMutation(
            internal.seedBetaAccounts.ensurePaidProfile,
            { userId: existingUserId }
          );
          results.push(`${email} - already exists, profile updated to paid`);
          continue;
        }

        const hashedPassword = hashPassword(password);

        await ctx.runMutation(internal.seedBetaAccounts.createBetaUser, {
          email,
          hashedPassword,
          name,
        });

        results.push(`${email} - created successfully`);
      } catch (error) {
        results.push(
          `${email} - error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log("Beta account seeding results:");
    results.forEach((r) => console.log(`  ${r}`));
    return results;
  },
});
