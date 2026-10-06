import React, { useState } from "react";
import CardListFlex from "../../../components/cards/cardlist";
import Card from "../../../components/cards/cards";
import AddStaff from "../../../features/addstaff/addStaff";
import StaffList from "../../../features/stafflist/staffList";
import StaffAttendance from "../../../features/staffAttendance/attendance";
import { Count } from "../../../features/dashboard";


export default function StaffManagement() {
  const [tab, setTab] = useState(2);

  const cards = [
    { id: 1, value: <Count resource="staff" />, description: "Staff" },
    {
      id: 2,
      value: <Count resource="staff" params={{ isActive: "true" }} />,
      description: "Active",
    },
    {
      id: 3,
      value: <Count resource="staff" params={{ isActive: "false" }} />,
      description: "Inactive",
    },
  ];

  return (
    <section className="flex flex-col gap-4 p-4 lg:flex-row">
      {/* Main Content */}
      <section className="w-full">
        <CardListFlex cards={cards} />

        {/* Tabs */}
        <div className="mt-4 flex gap-6 border-b border-gray-200">
          <button
            onClick={() => setTab(2)}
            className={`-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 2
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Staff list
          </button>
          <button
            onClick={() => setTab(3)}
            className={`-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 3
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Staff attendance
          </button>
          <button
            onClick={() => setTab(4)}
            className={`-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 4
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Payroll
          </button>
        </div>

        {/* Table */}
        <div className="mt-4">
          {tab === 2 && <StaffList />}
          {tab === 3 && <StaffAttendance />}
          {tab === 4 && (
            <p className="p-4 text-gray-500">Payroll isn't built yet.</p>
          )}
        </div>
      </section>

      {/* Notification Panel */}
      <aside className="w-full rounded-md bg-white p-4 shadow lg:w-[30%]">
        <h2 className="mb-2 text-xl font-semibold text-blue-600">
          Notifications
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-gray-700">
          <li>Staff meeting scheduled for Monday.</li>
          <li>New academic calendar released.</li>
          <li>Payroll processing ends Friday.</li>
          <li>Submit performance reviews.</li>
        </ul>
      </aside>
    </section>
  );
}