import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { shouldUseDemoStore } from "./demo-store";
import type { UserRole } from "./validators";

const credentialsSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter:
    process.env.GOOGLE_CLIENT_ID && !shouldUseDemoStore()
      ? PrismaAdapter(prisma)
      : undefined,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) || "CUSTOMER";
      } else if (token.sub && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        token.role = (dbUser?.role as UserRole) || "CUSTOMER";
      }
      return token;
    },
  },
});

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}
