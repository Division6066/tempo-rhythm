import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Scrypt } from "lucia";

export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    const scrypt = new Scrypt();
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

        const hashedPassword = await scrypt.hash(password);

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
