import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      if (!token) return false;

      // Protect doctor routes
      if (pathname.startsWith('/doctor')) {
        return token.role === 'DOCTOR' || token.role === 'ADMIN';
      }

      // Protect patient routes
      if (pathname.startsWith('/patient')) {
        return token.role === 'PATIENT';
      }

      return true;
    },
  },
});

export const config = {
  matcher: ['/doctor/:path*', '/patient/:path*'],
};
