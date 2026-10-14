import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Card from "../../components/cards/cards";
import Input from "../../components/inputs/input";
import Select from "../../components/inputs/select";
import PrimaryButton from "../../components/button/button";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/apiError";
import { useDepartments } from "../departments/useDepartments";
import { useFacultyOptions } from "../departments/useFacultyOptions";
import { countKeys, staffKeys } from "../../lib/queryKeys";

const STEPS = [
  "Bio Data",
  "Academics",
  "Department",
  "Account",
  "Login",
  "Review",
];

const EMPTY_BIO_DATA = {
  name: "",
  email: "",
  dob: "",
  phone: "",
  address: "",
};

const EMPTY_ACADEMIC = {
  level: "",
  institution: "",
  qualification: "",
  year: "",
  document: null,
};

const EMPTY_DEPARTMENT_DATA = {
  departmentId: "",
  facultyId: "",
  position: "",
  employmentType: "",
  employmentDate: "",
};

const EMPTY_ACCOUNT_DATA = {
  bankName: "",
  accountNumber: "",
  bvn: "",
};

const EMPTY_LOGIN_DATA = {
  password: "",
  confirmPassword: "",
};

function validateStep(step, values) {
  const errors = {};

  if (step === 1) {
    if (values.bioData.name.trim().length < 3) {
      errors.name = "Enter the staff member's full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.bioData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!values.bioData.dob) {
      errors.dob = "Date of birth is required.";
    }
  }

  if (step === 2) {
    values.academics.forEach((item, index) => {
      if (!item.level) errors[`academics.${index}.level`] = "Choose a level.";
      if (!item.institution.trim()) {
        errors[`academics.${index}.institution`] = "Enter an institution.";
      }
      if (!item.qualification.trim()) {
        errors[`academics.${index}.qualification`] = "Enter a qualification.";
      }
      const year = Number(item.year);
      if (!item.year || !Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
        errors[`academics.${index}.year`] = "Enter a valid year.";
      }
    });
  }

  if (step === 3) {
    if (!values.departmentData.departmentId.trim()) {
      errors.departmentId = "Enter a department ID.";
    }
    if (!values.departmentData.position) {
      errors.position = "Choose a position.";
    }
  }

  if (step === 4) {
    const accountValues = Object.values(values.accountData);
    if (accountValues.some((value) => value.trim()) && accountValues.some((value) => !value.trim())) {
      errors.accountData = "Complete all bank details or leave this section blank.";
    }
  }

  if (step === 5) {
    if (values.loginData.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (values.loginData.password !== values.loginData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
  }

  return errors;
}

export default function AddStaff() {
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [bioData, setBioData] = React.useState(EMPTY_BIO_DATA);
  const [academics, setAcademics] = React.useState([
    { ...EMPTY_ACADEMIC },
  ]);
  const [departmentData, setDepartmentData] = React.useState(EMPTY_DEPARTMENT_DATA);
  const [accountData, setAccountData] = React.useState(EMPTY_ACCOUNT_DATA);
  const [loginData, setLoginData] = React.useState(EMPTY_LOGIN_DATA);

  const values = { bioData, academics, departmentData, accountData, loginData };

  function goToNextStep() {
    const validationErrors = validateStep(step, values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function goToPreviousStep() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  async function submitStaff(event) {
    event.preventDefault();
    const validationErrors = validateStep(5, values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setStep(5);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    const documents = [];
    const academicPayload = academics.map((item) => {
      const academic = {
        level: item.level,
        institution: item.institution.trim(),
        qualification: item.qualification.trim(),
        year: Number(item.year),
      };
      if (item.document) {
        academic.documentIndex = documents.length;
        documents.push(item.document);
      }
      return academic;
    });
    const normalizedEmail = bioData.email.trim().toLowerCase();
    const hasAccountData = Object.values(accountData).some((value) => value.trim());

    const payload = {
      bioData: {
        name: bioData.name.trim(),
        email: normalizedEmail,
        dob: bioData.dob,
        phone: bioData.phone.trim(),
        address: bioData.address.trim(),
      },
      academics: academicPayload,
      departmentData: {
        departmentId: departmentData.departmentId.trim(),
        ...(departmentData.facultyId.trim()
          ? { facultyId: departmentData.facultyId.trim() }
          : {}),
        position: departmentData.position,
        employmentType: departmentData.employmentType,
        employmentDate: departmentData.employmentDate,
      },
      ...(hasAccountData
        ? {
            accountData: {
              bankName: accountData.bankName.trim(),
              accountNumber: accountData.accountNumber.trim(),
              bvn: accountData.bvn.trim(),
            },
          }
        : {}),
      loginData: {
        email: normalizedEmail,
        password: loginData.password,
      },
    };

    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    documents.forEach((file) => formData.append("documents", file));

    setSubmitting(true);
    try {
      const { data } = await api.post("/staff", formData);
      toast.success(data?.message || "Staff member added successfully.");
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: countKeys.all });
      setBioData({ ...EMPTY_BIO_DATA });
      setAcademics([{ ...EMPTY_ACADEMIC }]);
      setDepartmentData({ ...EMPTY_DEPARTMENT_DATA });
      setAccountData({ ...EMPTY_ACCOUNT_DATA });
      setLoginData({ ...EMPTY_LOGIN_DATA });
      setErrors({});
      setStep(1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to add staff member."));
    } finally {
      setSubmitting(false);
    }
  }

  function updateAcademic(index, field, value) {
    setAcademics((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  return (
    <div className="mx-auto w-full p-4">
      <h1 className="py-2 text-3xl text-blue-600 uppercase">Add Staff</h1>

      <Card className="mb-4 flex flex-wrap items-center justify-evenly gap-2 rounded-lg shadow-sm sm:min-h-12">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (stepNumber < step) {
                  setErrors({});
                  setStep(stepNumber);
                }
              }}
              disabled={stepNumber >= step}
              aria-current={step === stepNumber ? "step" : undefined}
              className={`rounded px-4 py-1 ${
                step === stepNumber
                  ? "bg-blue-600 text-white"
                  : stepNumber < step
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {stepNumber}. {label}
            </button>
          );
        })}
      </Card>

      <form onSubmit={submitStaff} className="space-y-6">
        {step === 1 && (
          <StaffBioData
            bioData={bioData}
            setBioData={setBioData}
            errors={errors}
          />
        )}
        {step === 2 && (
          <StaffAcademics
            academics={academics}
            updateAcademic={updateAcademic}
            setAcademics={setAcademics}
            errors={errors}
          />
        )}
        {step === 3 && (
          <StaffDepartment
            departmentData={departmentData}
            setDepartmentData={setDepartmentData}
            errors={errors}
          />
        )}
        {step === 4 && (
          <StaffAccount
            accountData={accountData}
            setAccountData={setAccountData}
            error={errors.accountData}
          />
        )}
        {step === 5 && (
          <StaffLogin
            loginData={loginData}
            setLoginData={setLoginData}
            email={bioData.email}
            errors={errors}
          />
        )}
        {step === 6 && (
          <StaffReview
            bioData={bioData}
            academics={academics}
            departmentData={departmentData}
            accountData={accountData}
          />
        )}

        <div className="flex justify-between">
          {step > 1 ? (
            <PrimaryButton type="button" onClick={goToPreviousStep} disabled={submitting}>
              Previous
            </PrimaryButton>
          ) : <span />}
          {step < STEPS.length ? (
            <PrimaryButton type="button" onClick={goToNextStep}>
              {step === 5 ? "Review details" : "Next"}
            </PrimaryButton>
          ) : (
            <PrimaryButton type="submit" isLoading={submitting} loadingText="Adding staff...">
              Add Staff
            </PrimaryButton>
          )}
        </div>
      </form>
    </div>
  );
}

function StaffBioData({ bioData, setBioData, errors }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setBioData((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="flex w-full flex-wrap justify-between">
      <Input
        name="name"
        label="Staff Name"
        onChange={handleChange}
        placeholder="Enter staff full name"
        className="w-full md:w-[48%]"
        value={bioData.name}
        error={errors.name ? { message: errors.name } : undefined}
      />
      <Input
        name="email"
        label="Staff Email"
        type="email"
        onChange={handleChange}
        placeholder="Enter staff email"
        className="w-full md:w-[48%]"
        value={bioData.email}
        error={errors.email ? { message: errors.email } : undefined}
      />
      <Input
        name="dob"
        label="Date of Birth"
        type="date"
        onChange={handleChange}
        className="w-full md:w-[48%]"
        value={bioData.dob}
        error={errors.dob ? { message: errors.dob } : undefined}
      />
      <Input
        name="phone"
        label="Phone Number"
        type="tel"
        onChange={handleChange}
        placeholder="Enter phone number"
        className="w-full md:w-[48%]"
        value={bioData.phone}
      />
      <div className="mb-4 w-full">
        <label htmlFor="address" className="mb-1 block font-medium text-blue-500 uppercase">
          Staff Address
        </label>
        <textarea
          id="address"
          name="address"
          onChange={handleChange}
          placeholder="Enter staff address"
          value={bioData.address}
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          rows={4}
        />
      </div>
    </section>
  );
}

function StaffAcademics({ academics, updateAcademic, setAcademics, errors }) {
  const levels = ["Primary", "Secondary", "Tertiary", "Postgraduate", "Other"];

  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-blue-700">
        Academic Qualifications
      </h2>
      {academics.map((entry, index) => (
        <fieldset
          key={index}
          className="mb-4 grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-5"
        >
          <legend className="px-1 font-medium">Qualification {index + 1}</legend>
          <Select
            label="Level"
            name={`level-${index}`}
            value={entry.level}
            onChange={(event) => updateAcademic(index, "level", event.target.value)}
            options={levels.map((level) => ({ label: level, value: level }))}
            error={errors[`academics.${index}.level`]}
          />
          <Input
            label="Institution"
            name={`institution-${index}`}
            value={entry.institution}
            onChange={(event) => updateAcademic(index, "institution", event.target.value)}
            placeholder="e.g. Example University"
            error={errors[`academics.${index}.institution`] ? { message: errors[`academics.${index}.institution`] } : undefined}
          />
          <Input
            label="Qualification"
            name={`qualification-${index}`}
            value={entry.qualification}
            onChange={(event) => updateAcademic(index, "qualification", event.target.value)}
            placeholder="e.g. B.Sc Mathematics"
            error={errors[`academics.${index}.qualification`] ? { message: errors[`academics.${index}.qualification`] } : undefined}
          />
          <Input
            label="Year Obtained"
            name={`year-${index}`}
            value={entry.year}
            onChange={(event) => updateAcademic(index, "year", event.target.value)}
            type="number"
            placeholder="e.g. 2012"
            error={errors[`academics.${index}.year`] ? { message: errors[`academics.${index}.year`] } : undefined}
          />
          <div>
            <label htmlFor={`document-${index}`} className="mb-1 block text-sm font-medium text-gray-700">
              Certificate (optional)
            </label>
            <input
              id={`document-${index}`}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => updateAcademic(index, "document", event.target.files?.[0] || null)}
              className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
            {entry.document && (
              <p className="mt-1 text-xs text-green-700">
                Selected: {entry.document.name}
              </p>
            )}
          </div>
          {academics.length > 1 && (
            <button
              type="button"
              onClick={() => setAcademics((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              className="text-left text-sm text-red-700 underline"
            >
              Remove qualification
            </button>
          )}
        </fieldset>
      ))}
      <PrimaryButton
        type="button"
        onClick={() => setAcademics((current) => [...current, { ...EMPTY_ACADEMIC }])}
        className="mt-2"
      >
        + Add More Qualification
      </PrimaryButton>
    </section>
  );
}

function StaffDepartment({ departmentData, setDepartmentData, errors }) {
  const faculties = useFacultyOptions();
  const departments = useDepartments({
    page: 1,
    limit: 100,
    facultyId: departmentData.facultyId,
  });
  const departmentRecords = departments.data?.departments ?? [];
  const departmentOptions = departmentRecords.map((department) => ({
    value: department.id,
    label: `${department.name}${department.code ? ` (${department.code})` : ""}`,
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDepartmentData((current) => {
      if (name === "facultyId") {
        return { ...current, facultyId: value, departmentId: "" };
      }

      if (name === "departmentId") {
        const department = departmentRecords.find((item) => item.id === value);
        return {
          ...current,
          departmentId: value,
          facultyId: department?.facultyId ?? department?.faculty?.id ?? current.facultyId,
        };
      }

      return { ...current, [name]: value };
    });
  };

  return (
    <section className="flex flex-wrap items-center justify-between gap-y-4">
      <p className="mb-2 w-full text-sm text-gray-600">
        Choose a faculty first to filter the available departments.
      </p>
      <Select
        label="Faculty (optional)"
        name="facultyId"
        value={departmentData.facultyId}
        onChange={handleChange}
        placeholder="All faculties"
        allowEmpty
        options={faculties.options}
        className="w-full md:w-[48%]"
        disabled={faculties.isLoading || faculties.isError}
      />
      <Select
        label="Department"
        name="departmentId"
        value={departmentData.departmentId}
        onChange={handleChange}
        placeholder={
          departments.isLoading
            ? "Loading departments..."
            : departmentRecords.length
              ? "Select a department"
              : "No departments available"
        }
        options={departmentOptions}
        className="w-full md:w-[48%]"
        error={errors.departmentId}
        disabled={departments.isLoading || departments.isError || departmentRecords.length === 0}
      />
      {faculties.isError && (
        <div role="alert" className="w-full text-sm text-red-700">
          {getErrorMessage(faculties.error, "Couldn't load faculties.")}
          <PrimaryButton type="button" onClick={() => faculties.refetch()} isLoading={faculties.isFetching} loadingText="Retrying..." className="ml-2 underline">
            Try again
          </PrimaryButton>
        </div>
      )}
      {departments.isError && (
        <div role="alert" className="w-full text-sm text-red-700">
          {getErrorMessage(departments.error, "Couldn't load departments.")}
          <PrimaryButton type="button" onClick={() => departments.refetch()} isLoading={departments.isFetching} loadingText="Retrying..." className="ml-2 underline">
            Try again
          </PrimaryButton>
        </div>
      )}
      {!departments.isLoading && !departments.isError && departmentRecords.length === 0 && (
        <p className="w-full text-sm text-gray-600">
          No departments found{departmentData.facultyId ? " for this faculty" : ""}. Add a department before creating a staff profile.
        </p>
      )}
      <Select
        label="Position"
        name="position"
        value={departmentData.position}
        onChange={handleChange}
        options={["Lecturer", "HOD", "Assistant Lecturer", "Admin Staff"].map((value) => ({ label: value, value }))}
        className="w-full md:w-[48%]"
        error={errors.position}
      />
      <Select
        label="Employment Type"
        name="employmentType"
        value={departmentData.employmentType}
        onChange={handleChange}
        options={["Full-time", "Part-time", "Contract"].map((value) => ({ label: value, value }))}
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
    </section>
  );
}

function StaffAccount({ accountData, setAccountData, error }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setAccountData((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="flex flex-wrap items-center justify-between gap-y-4">
      <p className="w-full text-sm text-gray-600">
        Optional. Leave all fields blank if bank details are not needed.
      </p>
      {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
      <Input
        label="Bank Name"
        name="bankName"
        value={accountData.bankName}
        onChange={handleChange}
        placeholder="e.g. Example Bank"
        className="w-full md:w-[48%]"
      />
      <Input
        label="Account Number"
        name="accountNumber"
        value={accountData.accountNumber}
        onChange={handleChange}
        placeholder="Enter account number"
        className="w-full md:w-[48%]"
      />
      <Input
        label="BVN"
        name="bvn"
        value={accountData.bvn}
        onChange={handleChange}
        placeholder="Enter BVN"
        className="w-full md:w-[48%]"
      />
    </section>
  );
}

function StaffLogin({ loginData, setLoginData, email, errors }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginData((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="flex flex-wrap items-center justify-between gap-y-4">
      <p className="w-full text-sm text-gray-600">
        The staff login will use the email entered in Bio Data: <strong>{email || "Not entered"}</strong>
      </p>
      <Input
        label="Password"
        name="password"
        type="password"
        value={loginData.password}
        onChange={handleChange}
        placeholder="At least 8 characters"
        className="w-full md:w-[48%]"
        error={errors.password ? { message: errors.password } : undefined}
      />
      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={loginData.confirmPassword}
        onChange={handleChange}
        placeholder="Re-enter the password"
        className="w-full md:w-[48%]"
        error={errors.confirmPassword ? { message: errors.confirmPassword } : undefined}
      />
    </section>
  );
}

function StaffReview({ bioData, academics, departmentData, accountData }) {
  const hasAccountData = Object.values(accountData).some((value) => value.trim());

  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Review staff details</h2>
      <ReviewGroup title="Bio Data">
        <p>{bioData.name} · {bioData.email}</p>
        <p>Date of birth: {bioData.dob || "—"} · Phone: {bioData.phone || "—"}</p>
        <p>Address: {bioData.address || "—"}</p>
      </ReviewGroup>
      <ReviewGroup title="Academic Qualifications">
        {academics.map((item, index) => (
          <p key={`${item.institution}-${index}`}>
            {item.level}: {item.qualification} — {item.institution} ({item.year})
            {item.document ? ` · ${item.document.name}` : ""}
          </p>
        ))}
      </ReviewGroup>
      <ReviewGroup title="Department and Employment">
        <p>Department ID: {departmentData.departmentId}</p>
        <p>Faculty ID: {departmentData.facultyId || "—"} · Position: {departmentData.position}</p>
        <p>Employment: {departmentData.employmentType || "—"} · Date: {departmentData.employmentDate || "—"}</p>
      </ReviewGroup>
      {hasAccountData && (
        <ReviewGroup title="Bank Details">
          <p>{accountData.bankName} · Account ending {accountData.accountNumber.slice(-4)}</p>
          <p>BVN: entered (not displayed)</p>
        </ReviewGroup>
      )}
      <p className="text-sm text-gray-600">
        Password fields are not included in this review.
      </p>
    </section>
  );
}

function ReviewGroup({ title, children }) {
  return (
    <div className="space-y-1 border-t pt-3 text-sm">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}
