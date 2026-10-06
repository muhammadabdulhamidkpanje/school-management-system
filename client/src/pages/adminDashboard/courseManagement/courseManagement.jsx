import React from "react";
import HorizontalButton from "../../../UI/horizontalButton";
import Input from "../../../components/inputs/input";
import { useForm } from "react-hook-form";
import Header from "../../../UI/headers";
import Headings from "../../../UI/headings";

const buttonData = [
  { label: "View Course", value: "1" },
  { label: "Add New Courses", value: "2" },
  { label: "Manage Categories", value: "3" },
];

export default function CourseManagement() {
  const [tab, setTab] = React.useState("2");
  const { register, formState: { errors } } = useForm();
    return (
    <section className="flex flex-col gap-4 p-4 lg:flex-row">
      <div className="w-[70%]">
        <HorizontalButton data={buttonData} tab={tab} setTab={setTab} />
        {tab === "1" && <ViewCourse />}
        {tab === "2" && <AddCourse register={register} errors={errors} />}
      </div>
      <aside className="w-[30%]">
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Quick Actions</h2>
          <ul className="flex flex-col gap-2">
            <li>
              <button className="w-full rounded-lg p-2 text-left hover:bg-gray-100">
                Action 1
              </button>
            </li>
            <li>
              <button className="w-full rounded-lg p-2 text-left hover:bg-gray-100">
                Action 2
              </button>
            </li>
            <li>
              <button className="w-full rounded-lg p-2 text-left hover:bg-gray-100">
                Action 3
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  );
}

function ViewCourse() {
  return <>
  <h1>View Course</h1>
  </>;
}
function AddCourse({ register, errors }) {
  return (
    <section>
        <Headings className="text-md text-bold">Add New Courses</Headings>
    <form>
      <Input
        label="Course Title"
        name="courseTitle"
        placeholder="Enter the course title"
        register={register}
        rules={{ required: "Course title is required" }}
        error={errors.courseTitle}
      />
    </form>
    </section>
  );
}
