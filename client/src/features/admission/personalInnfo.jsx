import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePersonalInfo } from "./admissionSlice"; // Adjust the import path as necessary
import Input from "../../components/inputs/input";

export default function PersonalInfoForm() {
  const dispatch = useDispatch();
  const personalInfo = useSelector((state) => state.admission.personalInfo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updatePersonalInfo({ [name]: value }));
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
          className="rounded p-2 border"
        />
        <input
          type="text"
          name="middleName"
          value={personalInfo.middleName}
          onChange={handleChange}
          placeholder="Middle Name"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="lastName"
          value={personalInfo.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="rounded border p-2"
        />
        <input
          type="date"
          name="dateOfBirth"
          value={personalInfo.dateOfBirth}
          onChange={handleChange}
          className="rounded border p-2"
        />
        <select
          name="gender"
          value={personalInfo.gender}
          onChange={handleChange}
          className="rounded border p-2"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input
          type="text"
          name="nationality"
          value={personalInfo.nationality}
          onChange={handleChange}
          placeholder="Nationality"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="stateOfOrigin"
          value={personalInfo.stateOfOrigin}
          onChange={handleChange}
          placeholder="State of Origin"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="lga"
          value={personalInfo.lga}
          onChange={handleChange}
          placeholder="Local Government Area (LGA)"
          className="rounded border p-2"
        />
        <input
          type="text"
          name="religion"
          value={personalInfo.religion}
          onChange={handleChange}
          placeholder="Religion"
          className="rounded border p-2"
        />
      </div>
    </div>
  );
}
