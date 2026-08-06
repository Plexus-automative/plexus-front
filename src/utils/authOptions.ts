// next
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// project imports
import axios from 'utils/axios';

const users = [
  {
    id: 1,
    name: 'Jone Doe',
    email: 'info@codedthemes.com',
    password: '123456'
  }
];

declare module 'next-auth' {
  interface User {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'login',
      credentials: {
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const internalUrl = process.env.NEXT_APP_INTERNAL_BACKEND_URL;
        const publicUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        // FIX: Use publicUrl (localhost) for local dev, internalUrl (backend) is for Docker
        let baseBackendUrl = publicUrl || internalUrl || '';
        
        // Remove trailing slashes and /api to avoid double slashes
        if (baseBackendUrl.endsWith('/api')) {
          baseBackendUrl = baseBackendUrl.slice(0, -4);
        }
        if (baseBackendUrl.endsWith('/')) {
          baseBackendUrl = baseBackendUrl.slice(0, -1);
        }
        const loginUrl = baseBackendUrl + '/api/account/login';


        // This runs server-side, so the backend sees THIS server as the caller. Forward
        // the browser's address and user agent, otherwise the journal d'activité records
        // the frontend container (or the Docker gateway) for every connection instead of
        // the machine the person actually logged in from.
        const headers = req?.headers as Record<string, string | undefined> | undefined;
        const clientIp = headers?.['x-forwarded-for']?.split(',')[0]?.trim() || headers?.['x-real-ip'];
        const clientUserAgent = headers?.['user-agent'];

        try {
          const res = await fetch(loginUrl, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: {
              'Content-Type': 'application/json',
              ...(clientIp ? { 'X-Client-Ip': clientIp } : {}),
              ...(clientUserAgent ? { 'X-Client-User-Agent': clientUserAgent } : {})
            },
          });


          if (!res.ok) {
            const errorText = await res.text();
            console.error('!!! Backend Login Failed !!!');
            console.error('Status:', res.status);
            console.error('Error Text:', errorText);
            throw new Error(errorText || 'Authentication failed');
          }

          const responseData = await res.json();

          if (res.ok && responseData.user) {
            responseData.user['accessToken'] = responseData.serviceToken;
            return responseData.user;
          } else {
            console.error('=== No user in response ===');
          }
        } catch (e: any) {
          console.error('=== AUTH ERROR ===');
          console.error('Error Type:', e.name);
          console.error('Error Message:', e.message);
          if (e.cause) {
            console.error('Error Cause:', e.cause);
          }
          console.error('Stack:', e.stack);
          throw new Error(e.message || 'Authentication failed');
        }

      }
    }),
    CredentialsProvider({
      id: 'register',
      name: 'Register',
      credentials: {
        firstname: { name: 'firstname', label: 'Firstname', type: 'text', placeholder: 'Enter Firstname' },
        lastname: { name: 'lastname', label: 'Lastname', type: 'text', placeholder: 'Enter Lastname' },
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        company: { name: 'company', label: 'Company', type: 'text', placeholder: 'Enter Company' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          const user = await axios.post('/api/account/register', {
            firstName: credentials?.firstname,
            lastName: credentials?.lastname,
            company: credentials?.company,
            password: credentials?.password,
            email: credentials?.email
          });

          if (user) {
            users.push(user.data);
            return user.data;
          }
        } catch (e: any) {
          const errorMessage = e?.message || e?.response?.data?.message || 'Something went wrong!';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.provider = account?.provider;
        token.role = (user as any).role;
        token.customerNo = (user as any).customerNo;
        token.vendorNo = (user as any).vendorNo;
        token.password = (user as any).password;
        token.catalogType = (user as any).catalogType;
        token.isPec = (user as any).isPec;
        token.isBriseDeGlace = (user as any).isBriseDeGlace;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.id = token.id;
        session.provider = token.provider;
        session.token = token;
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).customerNo = token.customerNo;
          (session.user as any).vendorNo = token.vendorNo;
          (session.user as any).password = token.password;
          (session.user as any).catalogType = token.catalogType;
          (session.user as any).isPec = token.isPec;
          (session.user as any).isBriseDeGlace = token.isBriseDeGlace;
        }
      }
      return session;
    },
    async signIn(params) {
      // Prevent JWT token issuance on registration
      if (params.account?.provider === 'register') {
        const baseUrl = process.env.NEXTAUTH_URL?.endsWith('/') ? process.env.NEXTAUTH_URL : `${process.env.NEXTAUTH_URL}/`;
        return `${baseUrl}login`;
      }
      // If user is not provided, sign-in failed
      if (!params.user) {
        return false;
      }
      return true;
    }
  },
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT) || 86400
  },
  jwt: {
    secret: process.env.NEXT_APP_JWT_SECRET || process.env.NEXTAUTH_SECRET
  },
  pages: {
    signIn: '/login',
    newUser: '/register'
  }
};
