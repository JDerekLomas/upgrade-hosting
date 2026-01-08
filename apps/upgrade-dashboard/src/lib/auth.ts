import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.PLATFORM_DATABASE_URL!);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      try {
        // Check if user exists in any tenant
        const existingUser = await sql`
          SELECT tu.*, t.slug as tenant_slug, t.name as tenant_name
          FROM tenant_users tu
          JOIN tenants t ON tu.tenant_id = t.id
          WHERE tu.email = ${user.email}
            AND tu.is_active = true
            AND t.status = 'active'
          LIMIT 1
        `;

        if (existingUser.length > 0) {
          // Update last login
          await sql`
            UPDATE tenant_users
            SET last_login_at = NOW()
            WHERE email = ${user.email}
          `;
          return true;
        }

        // Check for pending invitation
        const invitation = await sql`
          SELECT ti.*, t.slug as tenant_slug
          FROM tenant_invitations ti
          JOIN tenants t ON ti.tenant_id = t.id
          WHERE ti.email = ${user.email}
            AND ti.accepted_at IS NULL
            AND ti.expires_at > NOW()
          LIMIT 1
        `;

        if (invitation.length > 0) {
          // Accept invitation and create user
          const inv = invitation[0];
          await sql`
            INSERT INTO tenant_users (
              tenant_id, email, name, avatar_url, provider, provider_id, role
            ) VALUES (
              ${inv.tenant_id},
              ${user.email},
              ${user.name},
              ${user.image},
              ${account.provider},
              ${account.providerAccountId},
              ${inv.role}
            )
          `;

          await sql`
            UPDATE tenant_invitations
            SET accepted_at = NOW()
            WHERE id = ${inv.id}
          `;

          return true;
        }

        // No existing user or invitation - create new tenant (self-signup)
        if (process.env.ALLOW_SELF_SIGNUP === 'true') {
          const slug = generateSlug(user.email);

          const newTenant = await sql`
            INSERT INTO tenants (name, slug, status, plan)
            VALUES (
              ${user.name || user.email?.split('@')[0] || 'My Organization'},
              ${slug},
              'active',
              'free'
            )
            RETURNING id
          `;

          await sql`
            INSERT INTO tenant_users (
              tenant_id, email, name, avatar_url, provider, provider_id, role
            ) VALUES (
              ${newTenant[0].id},
              ${user.email},
              ${user.name},
              ${user.image},
              ${account.provider},
              ${account.providerAccountId},
              'owner'
            )
          `;

          return true;
        }

        // No access
        return false;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user?.email) {
        // Fetch tenant info for token
        const tenantUser = await sql`
          SELECT tu.*, t.id as tenant_id, t.slug as tenant_slug, t.name as tenant_name
          FROM tenant_users tu
          JOIN tenants t ON tu.tenant_id = t.id
          WHERE tu.email = ${user.email}
            AND tu.is_active = true
          LIMIT 1
        `;

        if (tenantUser.length > 0) {
          token.tenantId = tenantUser[0].tenant_id;
          token.tenantSlug = tenantUser[0].tenant_slug;
          token.tenantName = tenantUser[0].tenant_name;
          token.role = tenantUser[0].role;
          token.userId = tenantUser[0].id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.tenantName = token.tenantName as string;
        session.user.role = token.role as string;
        session.user.userId = token.userId as string;
      }
      return session;
    },
  },
});

function generateSlug(email: string): string {
  const base = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tenantId?: string;
      tenantSlug?: string;
      tenantName?: string;
      role?: string;
      userId?: string;
    };
  }
}
