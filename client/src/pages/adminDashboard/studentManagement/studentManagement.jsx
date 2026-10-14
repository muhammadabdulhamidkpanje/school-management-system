import React from "react";
import CardListFlex from "../../../components/cards/cardlist";
import StudentList from "./studentList";
import { Count } from "../../../features/dashboard";

export default function StudentManagement() {
  const cards = [
    { id: "all", value: <Count resource="students" />, description: "Students" },
    {
      id: "active",
      value: <Count resource="students" params={{ status: "ACTIVE" }} />,
      description: "Active",
    },
    {
      id: "graduated",
      value: <Count resource="students" params={{ status: "GRADUATED" }} />,
      description: "Graduated",
    },
    {
      id: "suspended",
      value: <Count resource="students" params={{ status: "SUSPENDED" }} />,
      description: "Suspended",
    },
  ];

  return (
    <section className="w-full p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-blue-700">Student Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review student records, maintain class placement and status, and update academic profiles.
        </p>
      </header>
      <CardListFlex cards={cards} />
      <StudentList />
    </section>
  );
}
