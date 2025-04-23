// components/form/PatientForm.tsx
'use client';

export default function PatientForm() {
  return (
    <form className="row g-3">
      <div className="col-md-6">
        <label className="form-label">First Name</label>
        <input type="text" className="form-control" />
      </div>
      <div className="col-md-6">
        <label className="form-label">Last Name</label>
        <input type="text" className="form-control" />
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-success">Submit</button>
      </div>
    </form>
  );
}
