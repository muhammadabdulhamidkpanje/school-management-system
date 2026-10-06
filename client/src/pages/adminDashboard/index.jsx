import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Modal from "../../UI/Modal";
import AddStaff from "../../features/addstaff/addStaff";
import DepartmentFormBody from "../../features/departments/departmentFormBody";
import FacultyFormBody from "../../features/faculties/facultyFormBody";
import { Count } from "../../features/dashboard";

const data = [
  { name: "Jan", users: 30 },
  { name: "Feb", users: 45 },
  { name: "Mar", users: 60 },
  {name: "April", users:80 },
];

// Small tinted icon badge instead of a large colorful hero icon — it should
// identify the category at a glance, not compete with the number for
// attention. tint = light bg / matching dark text from the same color family.
const cards = [
  {
    value: <Count resource="students" />,
    description: "Students",
    tint: "bg-blue-50 text-blue-600",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.843 3.282C19 17.946 15.866 21 12 21s-7-3.054-7-6.14a12.083 12.083 0 01.843-3.282L12 14z" />
      </svg>
    ),
    modalComponent: <div>Add Student</div>,
  },
  {
    value: <Count resource="staff" />,
    description: "Staff",
    tint: "bg-green-50 text-green-600",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    modalComponent: <AddStaff />,
  },
  {
    value: <Count resource="faculties" />,
    description: "Faculties",
    tint: "bg-purple-50 text-purple-600",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M21 10v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
        <path d="M3 17l9 4 9-4" />
      </svg>
    ),
    modalComponent: <FacultyFormBody />,
  },
  {
    value: <Count resource="departments" />,
    description: "Departments",
    tint: "bg-amber-50 text-amber-600",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    modalComponent: <DepartmentFormBody />,
  },
  {
    value: <Count resource="courses" />,
    description: "Courses",
    tint: "bg-red-50 text-red-600",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 20l9-5-9-5-9 5 9 5z" />
        <path d="M12 12V4l8 4" />
      </svg>
    ),
    modalComponent: <div>Add Course</div>,
  },
];

const AdminDashboard = () => {
  return (
    <section className="flex flex-col gap-6 bg-gray-100 p-4">
      {/* auto-fit instead of a fixed 4-per-row grid: 5 cards fill the row
          without leaving a lone card stranded on its own line. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {cards.map((card, index) => (
          <Modal key={index}>
            {/* overflow-hidden clips the Add button's bottom corners to the
                card's own radius, so button + stat read as one card, not
                two stacked blocks. */}
            <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex items-start justify-between gap-2 p-4">
                <div>
                  <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    {card.description}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${card.tint}`}
                >
                  {React.cloneElement(card.icon, { className: "h-5 w-5" })}
                </span>
              </div>

              <Modal.Open opens={card.description}>
                <button className="w-full border-t border-gray-100 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
                  Add {card.description.replace(/s$/, "")}
                </button>
              </Modal.Open>
              <Modal.Window width="" name={card.description}>
                <Modal.Header>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Add {card.description.replace(/s$/, "")}
                  </h2>
                </Modal.Header>
                {card.modalComponent}
              </Modal.Window>
            </div>
          </Modal>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-base font-medium text-gray-900">
          Monthly users
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip cursor={{ fill: "#f3f4f6" }} />
            <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default AdminDashboard;
