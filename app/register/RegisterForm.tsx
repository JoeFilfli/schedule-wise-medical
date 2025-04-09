'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function RegisterForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'PATIENT',
  });

  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/register', form);
      if (res.status === 200) {
        router.push('/login');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="col-md-6">
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="card card-body shadow-sm">

          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              id="firstName"
              className="form-control"
              placeholder="Enter first name"
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              id="lastName"
              className="form-control"
              placeholder="Enter last name"
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              className="form-select"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && (
            <div className="alert alert-warning text-center mb-3" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">Register</button>

          <div className="text-center mt-3">
            <small>
              Already have an account? <Link href="/login">Login</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
