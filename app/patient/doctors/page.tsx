'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Doctor {
  id: string
  firstName: string
  lastName: string
  doctorProfile: {
    specialty: string | null
    bio: string | null
  } | null
}

export default function DoctorSearchPage() {
  const [query, setQuery] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    fetchDoctors()
  }, [])

  async function fetchDoctors() {
    const res = await fetch(`/api/doctors?q=${query}`)
    const data = await res.json()
    setDoctors(data)
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Find a Doctor</h2>

      <div className="input-group mb-4">
        <input
          className="form-control"
          placeholder="Search by name or specialty..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchDoctors}>
          Search
        </button>
      </div>
    
      <ul className="list-group">
        {doctors.map((doc) => (
          <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{doc.firstName} {doc.lastName}</h5>
              <small className="text-muted">{doc.doctorProfile?.specialty}</small>
            </div>
            <Link href={`/patient/doctors/${doc.id}`} className="btn btn-outline-primary btn-sm">
              View Slots
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
