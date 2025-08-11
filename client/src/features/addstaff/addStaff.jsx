import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Input from "../../components/inputs/input";
import Card from "../../components/cards/cards";
import Select from "../../components/inputs/select";
import PrimaryButton from "../../components/button/button";
import { handleSetBioData, handleSetAcademics, handleSetDepartment, handleSetLogin, handleSetAccount } from "../addstaff/addstaffSlice"

export default function AddStaff() {
  const [tab, setTab] = React.useState(1);
  const dispatch = useDispatch();

  const [bioData, setBioData] = React.useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
    address: "",
  });

  const [academics, setAcademics] = React.useState([
    {
      level: "Primary",
      institution: "",
      qualification: "",
      document: null,
    },
  ]);
  const [departmentData, setDepartmentData] = React.useState({
    department: "",
    faculty: "",
    position: "",
    employmentType: "",
    employmentDate: "",
    document: null,
  });
  const [accountData, setAccountData] = React.useState({
    bankName: "",
    accountNumber: "",
    bvn: "",
  });
  const [loginData, setLoginData] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    // Submit to server here
  }

  function handleNext() {
    if (tab === 1) dispatch(handleSetBioData(bioData));
    if (tab === 2) dispatch(handleSetAcademics(academics));
    if (tab === 3) dispatch(handleSetDepartment(departmentData));
    if (tab === 4) dispatch(handleSetAccount(accountData));
    if (tab === 5) dispatch(handleSetLogin(loginData));
  

    setTab((prev) => Math.min(prev + 1, 5));
  }

  function handlePrev() {
    setTab((prev) => Math.max(prev - 1, 1));
  }

  return (
    <div className="mx-auto w-full p-4">
      <h1 className="py-2 text-3xl text-blue-600 uppercase">Add Staff</h1>

      <div className="mb-4">
        <Card className="flex h-12 items-center !justify-evenly gap-2 rounded-lg shadow-sm">
          {[
            { label: "Bio Data", value: 1 },
            { label: "Academics", value: 2 },
            { label: "Department", value: 3 },
            { label: "Account", value: 4 },
            { label: "Logins", value: 5 },
          ].map(({ label, value }) => (
            <PrimaryButton
              key={value}
              color="black"
              className={`px-4 py-1 ${
                tab === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </PrimaryButton>
          ))}
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {tab === 1 && (
          <StaffBioData bioData={bioData} setBioData={setBioData} />
        )}

        {tab === 2 && (
          <StaffAcademics academics={academics} setAcademics={setAcademics} />
        )}

        {/* Placeholder tabs */}
        {tab === 3 && (
          <StaffDepartment
            departmentData={departmentData}
            setDepartmentData={setDepartmentData}
          />
        )}
        {tab === 4 && (
          <StaffAccount
            accountData={accountData}
            setAccountData={setAccountData}
          />
        )}
        {tab === 5 && (
          <StaffLogin loginData={loginData} setLoginData={setLoginData} />
        )}

        <div className="flex justify-between">
          {tab > 1 && (
            <PrimaryButton type="button" onClick={handlePrev}>
              Previous
            </PrimaryButton>
          )}
          {tab < 5 ? (
            <PrimaryButton type="button" onClick={handleNext}>
              Next
            </PrimaryButton>
          ) : (
            <PrimaryButton type="submit">Submit</PrimaryButton>
          )}
        </div>
      </form>
    </div>
  );
}

function StaffBioData({bioData, setBioData}) {
  
  function handleChange(e) {
    const { name, value } = e.target;
    setBioData((prev) => ({ ...prev, [name]: value }));
  }
  return (
    <div className="flex flex-wrap w-full justify-between">
      <Input
        name="name"
        label="Staff Name"
        onChange={handleChange}
        type="text"
        placeholder="Enter Staff Name"
        className="w-full md:w-[48%]"
        value={bioData.name}
      />
      <Input
        name="email"
        label="Staff Email"
        onChange={handleChange}
        type="email"
        placeholder="Enter Staff Email"
        className="w-full md:w-[48%]"
        value={bioData.email}
      />
      <Input
        name="dob"
        label="Date of Birth"
        onChange={handleChange}
        type="date"
        className="w-full md:w-[48%]"
        value={bioData.dob}
      />
      <Input
        name="phone"
        label="Phone Number"
        onChange={handleChange}
        type="tel"
        placeholder="Enter Phone Number"
        className="w-full md:w-[48%]"
        value={bioData.phone}
      />
      <div className="mb-4 w-full">
        <label
          htmlFor="address"
          className="text mb-1 block font-medium text-blue-500 uppercase"
        >
          Staff Address
        </label>
        <textarea
          id="address"
          name="address"
          onChange={handleChange}
          placeholder="Enter Staff Address"
          value={bioData.address}
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          rows={4}
        />
      </div>
    </div>
  );
}

function StaffAcademics({ formData, setFormData }) {
  const [academics, setAcademics] = React.useState([
    {
      level: "Primary",
      institution: "",
      qualification: "",
      year: "",
      document: null,
    },
    {
      level: "Secondary",
      institution: "",
      qualification: "",
      year: "",
      document: null,
    },
    {
      level: "Tertiary",
      institution: "",
      qualification: "",
      year: "",
      document: null,
    },
  ]);

  const levels = ["Primary", "Secondary", "Tertiary", "Postgraduate", "Other"];

  const handleAcademicChange = (index, field, value) => {
    const updated = [...academics];
    updated[index][field] = value;
    setAcademics(updated);
    setFormData({ ...formData, academics: updated });
  };

  const handleDocumentChange = (index, file) => {
    const updated = [...academics];
    updated[index].document = file;
    setAcademics(updated);
    setFormData({ ...formData, academics: updated });
  };

  const addMore = () => {
    setAcademics([
      ...academics,
      {
        level: "Other",
        institution: "",
        qualification: "",
        year: "",
        document: null,
      },
    ]);
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-blue-700 mb-4">
        Academic Qualifications
      </h2>

      {academics.map((entry, index) => (
        <div
          key={index}
          className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg border"
        >
          <Select
            label="Level"
            name={`level-${index}`}
            value={entry.level}
            onChange={(e) =>
              handleAcademicChange(index, "level", e.target.value)
            }
            options={levels.map((l) => ({ label: l, value: l }))}
          />
          <Input
            label="Institution"
            name={`institution-${index}`}
            value={entry.institution}
            onChange={(e) =>
              handleAcademicChange(index, "institution", e.target.value)
            }
            placeholder="e.g., ABC Primary School"
          />
          <Input
            label="Qualification"
            name={`qualification-${index}`}
            value={entry.qualification}
            onChange={(e) =>
              handleAcademicChange(index, "qualification", e.target.value)
            }
            placeholder="e.g., FSLC, SSCE, B.Sc"
          />
          <Input
            label="Year Obtained"
            name={`year-${index}`}
            value={entry.year}
            onChange={(e) =>
              handleAcademicChange(index, "year", e.target.value)
            }
            type="number"
            placeholder="e.g., 2012"
          />
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Certificate Upload
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                handleDocumentChange(index, e.target.files[0] || null)
              }
              className="block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
            />
            {entry.document && (
              <p className="text-xs text-green-700 mt-1">
                Selected: {entry.document.name}
              </p>
            )}
          </div>
        </div>
      ))}

      <PrimaryButton type="button" onClick={addMore} className="mt-2">
        + Add More Qualification
      </PrimaryButton>
    </div>
  );
}

function StaffDepartment({ departmentData, setDepartmentData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-1/2 flex-wrap items-center justify-between space-y-4">
      <Input
        label="Department"
        name="department"
        value={departmentData.department}
        onChange={handleChange}
        placeholder="e.g. Computer Science"
        className="w-full md:w-[48%]"
      />

      <Input
        label="Faculty / School"
        name="faculty"
        value={departmentData.faculty}
        onChange={handleChange}
        placeholder="e.g. Faculty of Science"
        className="w-full md:w-[48%]"
      />

      <Select
        label="Position"
        name="position"
        value={departmentData.position}
        onChange={handleChange}
        options={["Lecturer", "HOD", "Assistant Lecturer", "Admin Staff"].map((i) => ({ label: i, value: i }))}
        className="w-full md:w-[48%]"
      />

      <Select
        label="Employment Type"
        name="employmentType"
        value={departmentData.employmentType}
        onChange={handleChange}
        options={["Full-time", "Part-time", "Contract"].map((i) => ({ label: i, value: i }))}
        className="w-full md:w-[48%]"
      />

      <Input
        label="Employment Date"
        name="employmentDate"
        type="date"
        value={departmentData.employmentDate}
        onChange={handleChange}
        className="w-full md:w-[48%]"
      />
    </div>
  );
}

function StaffAccount({ accountData, setAccountData }) {
  const handleChange = (e) => {
    const {name, value} = e.target;
    setAccountData((prev) => ({
      prev, 
      [name]: value,
    }))
  }
  return(
    <div className="flex flex-wrap items-center justify-between space-y-4"> 
      <Input
        label="Bank Name"
        name="bankName"
        value={accountData.bankName}
        onChange={handleChange}
        placeholder= "e.g First Bank"
        className="w-full md:w-[48%]"
      />
      <Input
        label="Account Number"
        name="accountNumber"  
        value={accountData.accountNumber}
        onChange={handleChange}
        placeholder="e.g. 123456789"
        className="w-full md:w-[48%]"
      />
      <Input
        label="BVN"
        name="bvn"
        value={accountData.bvn}
        onChange={handleChange}
        placeholder="e.g. 123456789"
        className="w-full md:w-[48%]"
      />
    </div>
  )
}

function StaffLogin({ loginData, setLoginData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }; 

  return (
    <div className="flex flex-wrap items-center justify-between space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        value={loginData.email}
        onChange={handleChange}
        placeholder="e.g. john.doe@example.com"
        className="w-full md:w-[48%]"
      />

      <Input
        label="Enter Password"
        name="password"
        type="password"
        value={loginData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        className="w-full md:w-[48%]"
      />

      <Input
        label="Enter Password"
        name="password"
        type="password"
        value={loginData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        className="w-full md:w-[48%]"
      />
    </div>
  );

}