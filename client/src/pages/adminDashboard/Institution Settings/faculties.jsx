import React from "react";
import Headings from "../../../UI/headings";
import { FacultyList } from "../../../features/faculties";

// Thin page wrapper: all the data logic lives in features/faculties.
export default function FacultySettings() {
  return (
    <div>
      <Headings className="text-xl font-semibold">Faculty Settings</Headings>
      <div className="w-full shadow">
        <FacultyList />
      </div>
    </div>
  );
}
