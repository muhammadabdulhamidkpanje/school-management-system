import React from "react";
import Headings from "../../../UI/headings";
import VerticalButton from "../../../UI/verticalButton";
import Input from "../../../components/inputs/input";
import { useForm } from "react-hook-form";
import FileInput from "../../../UI/fileInput";
import PrimaryButton from "../../../components/button/button";

const facultyButtons = [
  { label: "Faculties", value: 1 },
  { label: "Add Faculty", value: 2 },
];

export default function FacultySettings() {
  const [tab, setTab] = React.useState(2);
  return (
    <div>
      <Headings className="text-xl font-semibold">Faculty Settings</Headings>
      <div className="flex w-full flex-wrap justify-between gap-2">
        <VerticalButton
          data={facultyButtons}
          className="w-[24%]"
          tab={tab}
          setTab={setTab}
          onClick={setTab}
        />
        <div className="w-full shadow sm:w-[73%]">
            {tab === 1 && <FacultyViews />}
            {tab === 2 && <AddFaculty />}

        </div>
      </div>
    </div>
  );
}

function FacultyViews() {
    return (
        <div className="p-4 w-full">
            <Headings className="text-sm font-semibold">Faculty Views</Headings>
            <div className="p-4">
                <p>List of faculties will be displayed here.</p>
            </div>
        </div>
    )
}

function AddFaculty() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    return (
        <div className="p-4 w-full">
            <Headings className="text-sm font-semibold">Add Faculty</Headings>
            <div className="p-4">
                <form onSubmit={handleSubmit((data) => {
                    console.log(data);
                })}>
                    <Input 
                        label="Faculty Name"
                        name="facultyName"
                        placeholder="Enter faculty name"
                        register={register}
                        rules={{ required: "Faculty name is required" }}
                        error={errors.facultyName}
                        />
                    <Input
                        label="Faculty Address"
                        name="facultyAddress"
                        placeholder="Enter faculty address"
                        register={register} 
                        rules={{ required: "Faculty address is required" }}
                        error={errors.facultyAddress}
                    />
                    <FileInput
                        label="Faculty Image"
                        name="facultyImage"
                        register={register}
                    />
                    <PrimaryButton width="100%" type="submit" className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                        Add Faculty
                    </PrimaryButton>
                </form>
            </div>
        </div>
    )
}
