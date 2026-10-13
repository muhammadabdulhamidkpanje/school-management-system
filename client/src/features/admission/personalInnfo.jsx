import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAdmissionForm } from "./admissionSlice";

export default function PersonalInfoForm() {
  const dispatch = useDispatch();
  const personalInfo = useSelector((state) => state.admission);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateAdmissionForm({ [name]: value }));
  };

  return (
    <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Personal Information</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          name="firstName"
          value={personalInfo.firstName}
          onChange={handleChange}
          placeholder="First Name"
          aria-label="First name"
          autoComplete="given-name"
          required
          className="rounded border p-2"
        />
        <input
          type="text"
          name="middleName"
          value={personalInfo.middleName}
          onChange={handleChange}
          placeholder="Middle Name"
          aria-label="Middle name"
          autoComplete="additional-name"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="lastName"
          value={personalInfo.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          aria-label="Last name"
          autoComplete="family-name"
          required
          className="rounded border p-2"
        />
        <input
          type="email"
          name="email"
          value={personalInfo.email}
          onChange={handleChange}
          placeholder="E-mail"
          aria-label="Email"
          autoComplete="email"
          required
          className="rounded border p-2"
        />
        <input
          type="date"
          name="dateOfBirth"
          value={personalInfo.dateOfBirth}
          onChange={handleChange}
          aria-label="Date of birth"
          required
          className="rounded border p-2"
        />
        <select
          name="gender"
          value={personalInfo.gender}
          onChange={handleChange}
          aria-label="Gender"
          required
          className="rounded border p-2"
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="nationality"
          value={personalInfo.nationality}
          onChange={handleChange}
          placeholder="Nationality"
          aria-label="Nationality"
          autoComplete="country-name"
          required
          className="rounded border p-2"
        />
        <input
          type="text"
          name="stateOfOrigin"
          value={personalInfo.stateOfOrigin}
          onChange={handleChange}
          placeholder="State of Origin"
          aria-label="State of origin"
          required
          className="rounded border p-2"
        />
        <input
          type="text"
          name="lga"
          value={personalInfo.lga}
          onChange={handleChange}
          placeholder="Local Government Area (LGA)"
          aria-label="Local Government Area"
          required
          className="rounded border p-2"
        />
        <input
          type="text"
          name="religion"
          value={personalInfo.religion}
          onChange={handleChange}
          placeholder="Religion"
          aria-label="Religion"
          className="rounded border p-2"
        />
      </div>
    </div>
  );
}
