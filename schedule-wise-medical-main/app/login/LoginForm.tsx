// app/login/LoginForm.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid email or password');
    }

    if (res?.ok) {
      router.push('/');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="col-md-6">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleLogin} className="card card-body shadow-sm">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              className="form-control"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-danger text-center mb-3">{error}</div>
          )}

          <button type="submit" className="btn btn-primary w-100">Login</button>

          <div className="text-center mt-3">
            <small>
              Don't have an account?{' '}
              <Link href="/register">Register</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
