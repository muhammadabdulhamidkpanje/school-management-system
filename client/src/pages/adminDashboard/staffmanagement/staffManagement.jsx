import React, { useState } from "react";
import CardListFlex from "../../../components/cards/cardlist";
import AddStaff from "../../../features/addstaff/addStaff";
import StaffList from "../../../features/stafflist/staffList";
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
    <section className="w-full p-4">
        <CardListFlex cards={cards} />

        <div className="mt-4 flex gap-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setTab(1)}
            className={`-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 1
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Add staff
          </button>
          <button
            type="button"
            onClick={() => setTab(2)}
            className={`-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 2
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Staff list
          </button>
          <span className="px-1 py-2.5 text-sm text-gray-400">
            Staff attendance (not available)
          </span>
          <span className="px-1 py-2.5 text-sm text-gray-400">
            Payroll (not available)
          </span>
        </div>

        <div className="mt-4">
          {tab === 1 && <AddStaff />}
          {tab === 2 && <StaffList />}
        </div>
    </section>
  );
}