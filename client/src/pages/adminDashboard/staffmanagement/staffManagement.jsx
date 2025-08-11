import React, { useState } from "react";
import CardListFlex from "../../../components/cards/cardlist";
import Card from "../../../components/cards/cards";
import AddStaff from "../../../features/addstaff/addStaff";
import StaffList from "../../../features/stafflist/staffList";
import StaffAttendance from "../../../features/staffAttendance/attendance";

export default function StaffManagement() {
  const [tab, setTab] = useState(1);

  const cards = [
    {
      id: 1,
      image: { src: "/images/edu.jpg", alt: "Education" },
      link: { href: "/learn", label: "Learn more" },
      title: "300",
      description: "Staff",
    },
    {
      id: 2,
      image: { src: "/images/tech.jpg", alt: "Technology" },
      link: { href: "/tech", label: "Discover" },
      title: "180",
      description: "Academic Staff",
    },
    {
      id: 3,
      image: { src: "/images/science.jpg", alt: "Science" },
      link: { href: "/science", label: "Explore" },
      title: "120",
      description: "Non-Academic Staff",
    },
    {
      id: 4,
      image: { src: "/images/science.jpg", alt: "Science" },
      link: { href: "/science", label: "Explore" },
      title: "20",
      description: "Administrative Staff",
    },
  ];

  

  return (
    <section className="flex flex-col gap-4 p-4 lg:flex-row">
      {/* Main Content */}
      <section className="w-full">
        <CardListFlex cards={cards} />

        {/* Tabs */}
        <Card className="flex flex-wrap items-center !justify-evenly gap-2 rounded-md bg-white p-4 shadow">
          <button
            onClick={() => setTab(1)}
            className={`rounded-md px-6 py-2 uppercase ${
              tab === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Add Staff
          </button>
          <button
            onClick={() => setTab(2)}
            className={`rounded-md px-4 py-2 uppercase ${
              tab === 2 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Staff List
          </button>
          <button
            onClick={() => setTab(3)}
            className={`rounded-md px-4 py-2 uppercase ${
              tab === 3 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Staff Attendance
          </button>
          <button
            onClick={() => setTab(4)}
            className={`rounded-md px-4 py-2 uppercase ${
              tab === 4 ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Payroll
          </button>
        </Card>

        {/* Table */}
        {tab === 1 && <AddStaff />}
        {tab === 2 && <StaffList />}
        {tab === 3 && <StaffAttendance />}
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
