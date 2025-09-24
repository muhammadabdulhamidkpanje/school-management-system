import React from "react";
import Headings from "../../../UI/headings";
import VerticalButton from "../../../UI/verticalButton";
import Input from "../../../components/inputs/input";
import Select from "../../../components/inputs/select";
import { useForm } from "react-hook-form";
import FileInput from "../../../UI/fileInput";
import PrimaryButton from "../../../components/button/button";

const departmentButtons = [
  { label: "Departments", value: 1 },
  { label: "Add Department", value: 2 },
];

export default function DepartmentSettings() {
  const [tab, setTab] = React.useState(2);
  return (
    <div>
      <Headings className="text-xl font-semibold">Department Settings</Headings>
      <div className="flex w-full flex-wrap justify-between gap-2">
        <VerticalButton
          data={departmentButtons}
          className="w-[24%]"
          tab={tab}
          setTab={setTab}
          onClick={setTab}
        />
        <div className="w-full shadow sm:w-[73%]">
            {tab === 1 && <DepartmentViews />}
            {tab === 2 && <AddDepartment />}

        </div>
      </div>
    </div>
  );
}

function DepartmentViews() {
    return (
        <div className="p-4 w-full">
            <Headings className="text-sm font-semibold">Department Views</Headings>
            <div className="p-4">
                <p>List of departments will be displayed here.</p>
            </div>
        </div>
    )
}

function AddDepartment() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    return (
        <div className="p-4 w-full">
            <Headings className="text-sm font-semibold">Add Department</Headings>
            <div className="p-4">
                <form onSubmit={handleSubmit((data) => {
                    console.log(data);
                })}>
                    <Input
                        label="Department Name"
                        name="departmentName"
                        placeholder="Enter department name"
                        register={register}
                        rules={{ required: "Department name is required" }}
                        error={errors.departmentName}
                    />
                    <Input
                        label="Department Address"
                        name="departmentAddress"
                        placeholder="Enter department address"
                        register={register}
                        rules={{ required: "Department address is required" }}
                        error={errors.departmentAddress}
                    />
                    <Select
                        label="Select Faculty"
                        name="fuculty"
                        options={[
                            { value: "head1", label: "Head 1" },
                            { value: "head2", label: "Head 2" },
                        ]}
                        register={register}
                        rules={{ required: "Department head is required" }}
                        error={errors.departmentHead}
                    />
                    <Input
                        label="Department Address"
                        name="departmentAddress"
                        placeholder="Enter department address"
                        register={register}
                        rules={{ required: "Department address is required" }}
                        error={errors.departmentAddress}
                    />
                    <FileInput
                        label="Department Image"
                        name="departmentImage"
                        register={register}
                    />
                    <PrimaryButton width="100%" type="submit" className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                        Add Department
                    </PrimaryButton>
                </form>
            </div>
        </div>
    )
}
