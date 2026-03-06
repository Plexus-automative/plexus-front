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
  secret: process.env.NEXTAUTH_SECRET_KEY,
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'login',
      credentials: {
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          // Send login request to the new Java Backend AuthController
          const res = await fetch('http://localhost:8080/api/account/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              password: credentials?.password,
              email: credentials?.email
            })
          });

          const data = await res.json();

          if (res.ok && data.user) {
            data.user['accessToken'] = data.serviceToken;
            return data.user;
          } else {
            throw new Error(data.message || 'Login failed');
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
