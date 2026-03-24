import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// ════════════════════════════════════════════════════
// LOCAL CREDENTIAL AUTH — validates entirely from env
// No external backend dependency
// ════════════════════════════════════════════════════

// Hardcoded fallbacks ensure login ALWAYS works,
// even if .env.local hasn't been picked up yet.
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@eloktantra.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@1234';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputEmail = credentials.email.trim().toLowerCase();
        const inputPass  = credentials.password;

        const emailMatch    = inputEmail === ADMIN_EMAIL.toLowerCase();
        const passwordMatch = inputPass  === ADMIN_PASSWORD;

        // Debug log (visible in terminal — remove before production)
        console.log('[AdminAuth] Login attempt:', inputEmail);
        console.log('[AdminAuth] Email match:', emailMatch, '| Password match:', passwordMatch);

        if (!emailMatch || !passwordMatch) {
          throw new Error('Invalid credentials. Access Denied.');
        }

        return {
          id:    'admin-001',
          name:  'eLoktantra Admin',
          email: ADMIN_EMAIL,
          role:  'ADMIN',
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role  = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
        session.adminKey  = process.env.ADMIN_SECRET_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge:   8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'eLoktantra-NextAuth-Secret-AdminPortal-2024',
};
