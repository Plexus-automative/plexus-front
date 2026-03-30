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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const internalUrl = process.env.NEXT_APP_INTERNAL_BACKEND_URL;
        const publicUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        // Remove trailing /api from publicUrl if it exists to avoid double /api
        const baseBackendUrl = internalUrl || (publicUrl?.endsWith('/api') ? publicUrl.slice(0, -4) : publicUrl);
        const loginUrl = (baseBackendUrl || '') + '/api/account/login';

        console.log('--- AUTH ATTEMPT ---');
        console.log('Internal URL Env:', internalUrl);
        console.log('Public URL Env:', publicUrl);
        console.log('Resolved Login URL:', loginUrl);

        try {
          const res = await fetch(loginUrl, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('Backend Login Failed:', res.status, errorText);
            throw new Error(errorText || 'Authentication failed');
          }

          const responseData = await res.json();
          console.log('Backend Login Success:', responseData.user?.email);

          if (res.ok && responseData.user) {
            responseData.user['accessToken'] = responseData.serviceToken;
            return responseData.user;
          } else {
          }
        } catch (e: any) {
          const errorMessage = e?.message || e?.response?.data?.message || 'Something went wrong!';
          throw new Error(errorMessage);
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
      console.log(">>> [NEXTAUTH] JWT Callback - user:", user);
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.provider = account?.provider;
        token.role = (user as any).role;
        token.customerNo = (user as any).customerNo;
        token.vendorNo = (user as any).vendorNo;
      }
      console.log(">>> [NEXTAUTH] JWT Callback - Output token:", token);
      return token;
    },
    session: ({ session, token }) => {
      console.log(">>> [NEXTAUTH] SESSION Callback - Input token:", token);
      if (token) {
        session.id = token.id;
        session.provider = token.provider;
        session.token = token;
        console.log(">>> [NEXTAUTH] SESSION Callback - session.user:", session.user);
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).customerNo = token.customerNo;
          (session.user as any).vendorNo = token.vendorNo;
        }
      }
      console.log(">>> [NEXTAUTH] SESSION Callback - Final session:", session);
      return session;
    },
    async signIn(params) {
      // Prevent JWT token issuance on registration
      if (params.account?.provider === 'register') {
        return `${process.env.NEXTAUTH_URL}login`;
      }
      return true;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT!)
  },
  jwt: {
    secret: process.env.NEXT_APP_JWT_SECRET
  },
  pages: {
    signIn: '/login',
    newUser: '/register'
  }
};
