'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/getCroppedImg';
import type { Area } from 'react-easy-crop';
import { useRouter } from 'next/navigation';

export default function EditProfileForm({ user, isDoctor = false }: { user: any; isDoctor?: boolean}) {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(user?.profilePicture || null);
  const [message, setMessage] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const specialty = form.get('specialty') as string;
    const bio = form.get('bio') as string;

    form.set('specialty', specialty);
    form.set('bio', bio);

    let newPreviewUrl: string | null = null;
  
    if (imageSrc && croppedAreaPixels) {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      newPreviewUrl = URL.createObjectURL(blob); // new preview from cropped image
      form.set('profilePicture', blob, 'profile.jpg');
    }
  
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      body: form,
    });
  
    if (res.ok) {
      if (imageSrc) {
        setImageSrc(null); // hide crop UI
        if (newPreviewUrl) {
          setPreview(newPreviewUrl); // update preview locally
        }
      }
      setMessage('Profile updated successfully');
      router.refresh(); // make sure server-side data is also fresh
    } else {
      setMessage('Something went wrong');
    }
  };
  

  return (
    <>
      {preview && !imageSrc && (
        <div className="d-flex justify-content-center mb-4">
          <Image
            src={preview}
            alt="Profile"
            width={150}
            height={150}
            className="rounded-circle border shadow"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="mt-4">
        <div className="mb-3">
          <label>First Name</label>
          <input name="firstName" defaultValue={user.firstName} className="form-control" required />
        </div>

        <div className="mb-3">
          <label>Last Name</label>
          <input name="lastName" defaultValue={user.lastName} className="form-control" required />
        </div>

        {isDoctor && (
          <>
            <div className="mb-3">
              <label>Specialty</label>
              <input name="specialty" defaultValue={user.doctorProfile?.specialty ?? ''} className="form-control" />
            </div>
            <div className="mb-3">
              <label>Bio</label>
              <textarea name="bio" defaultValue={user.doctorProfile?.bio ?? ''} rows={3} className="form-control" />
            </div>
          </>
        )}

        <div className="mb-3">
          <label>Email (readonly)</label>
          <input className="form-control" value={user.email} readOnly disabled />
        </div>

        <div className="mb-3">
          <label>Phone Number</label>
          <input name="phoneNumber" defaultValue={user.phoneNumber ?? ''} className="form-control" />
        </div>

        <div className="mb-3">
          <label>Change Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="form-control" />
        </div>

        {imageSrc && (
          <div className="mb-3">
            <div style={{ position: 'relative', width: '100%', height: 300 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="form-range mt-2"
            />
          </div>
        )}

        <button className="btn btn-primary">Update Profile</button>
        {message && <p className="mt-2 text-success">{message}</p>}
      </form>
    </>
  );
}
