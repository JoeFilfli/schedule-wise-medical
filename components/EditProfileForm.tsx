// components/EditProfileForm.tsx

'use client';

import { useState, FormEvent } from 'react';
import { Form, Button, Alert, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface UserProps {
  id:               string;
  firstName:        string;
  lastName:         string;
  email:            string;
  phoneNumber?:     string | null;
  profilePicture?:  string | null;
  balance?:         number;
  doctorProfile?: {
    specialty?: string | null;
    bio?:       string | null;
  };
}

interface EditProfileFormProps {
  user:      UserProps;
  isDoctor?: boolean;
}

export default function EditProfileForm({
  user,
  isDoctor = false
}: EditProfileFormProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName,  setLastName]  = useState(user.lastName);
  const [email,     setEmail]     = useState(user.email);
  const [phone,     setPhone]     = useState(user.phoneNumber ?? '');
  const [specialty, setSpecialty] = useState(user.doctorProfile?.specialty ?? '');
  const [bio,       setBio]       = useState(user.doctorProfile?.bio ?? '');
  const [feedback,  setFeedback]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload: any = {
        firstName,
        lastName,
        email,
        phoneNumber: phone || null
      };
      if (isDoctor) {
        payload.specialty = specialty || null;
        payload.bio       = bio       || null;
      }

      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }

      setFeedback('Profile updated successfully!');
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {user.profilePicture && (
        <div className="text-center mb-4">
          <Image
            src={user.profilePicture}
            roundedCircle
            width={100}
            height={100}
            alt="Profile picture"
          />
        </div>
      )}

      <Form.Group className="mb-3" controlId="firstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="lastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="phone">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="e.g. +1 555‑1234"
        />
        {isDoctor && user.balance !== undefined && (
          <Form.Text className="text-muted">
            Current balance: ${user.balance.toFixed(2)}
          </Form.Text>
        )}
      </Form.Group>

      {isDoctor && (
        <>
          <Form.Group className="mb-3" controlId="specialty">
            <Form.Label>Specialty</Form.Label>
            <Form.Control
              type="text"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              placeholder="e.g. General Practitioner"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="bio">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Brief biography..."
            />
          </Form.Group>
        </>
      )}

      {feedback && (
        <Alert variant={feedback.startsWith('Profile updated') ? 'success' : 'danger'}>
          {feedback}
        </Alert>
      )}

      <div className="d-grid">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </Form>
  );
}
