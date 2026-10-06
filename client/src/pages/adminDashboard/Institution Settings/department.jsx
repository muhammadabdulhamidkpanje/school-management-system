import React from "react";
import Headings from "../../../UI/headings";
import { DepartmentList } from "../../../features/departments";

// Thin page wrapper: all the data logic lives in features/departments.
export default function DepartmentSettings() {
  return (
    <div>
      <Headings className="text-xl font-semibold">Department Settings</Headings>
      <div className="w-full shadow">
        <DepartmentList />
      </div>
    </div>
  );
}
