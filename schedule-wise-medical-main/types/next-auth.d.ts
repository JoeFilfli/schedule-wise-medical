import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
      firstName: string;
      lastName: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
    firstName: string;
    lastName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
    firstName: string;
    lastName: string;
  }
}
