import React from "react";
import Card from "../../components/cards/cards";
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

const data = [
  { name: "Jan", users: 30 },
  { name: "Feb", users: 45 },
  { name: "Mar", users: 60 },
];

const cards = [
  {
    title: "300",
    description: "Students",
    icon: (
      <svg
        className="h-12 w-12 text-blue-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.843 3.282C19 17.946 15.866 21 12 21s-7-3.054-7-6.14a12.083 12.083 0 01.843-3.282L12 14z" />
      </svg>
    ),
    modalComponent: <div>Add Student</div>,
  },
  {
    title: "80",
    description: "Staff",
    icon: (
      <svg
        className="h-12 w-12 text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    modalComponent: <AddStaff />,
  },
  {
    title: "7",
    description: "Faculties",
    icon: (
      <svg
        className="h-12 w-12 text-purple-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M21 10v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
        <path d="M3 17l9 4 9-4" />
      </svg>
    ),
    modalComponent: <div>Add Faculty</div>,
  },
  {
    title: "30",
    description: "Departments",
    icon: (
      <svg
        className="h-12 w-12 text-yellow-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    modalComponent: "",
  },
  {
    title: "120",
    description: "Courses",
    icon: (
      <svg
        className="h-12 w-12 text-red-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 20l9-5-9-5-9 5 9 5z" />
        <path d="M12 12V4l8 4" />
      </svg>
    ),
    modalComponent: <div>Add Course</div>,
  },
];

const AdminDashboard = () => {
  return (
    <section className="flex flex-col gap-6 bg-gray-100 p-4 md:flex-row md:gap-8">
      {/* Left side: Cards */}
      <div className="-mx-2 flex w-full flex-wrap">
        {cards.map((card, index) => (
          <div key={index} className="mb-4 h-25 w-full px-2 sm:w-1/2 lg:w-1/4">
            <Card
              cardDetails={card}
              className="h-full w-full bg-white shadow-md"
            >
              {/* <Card.Image>
                <div className="flex h-28 items-center justify-center">
                  {card.icon}
                </div>
              </Card.Image> */}

              <Card.Body>
                <div className="flex w-full flex-col items-center justify-center">
                  <h3 className="text-3xl font-bold text-gray-800">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </Card.Body>

              <Modal>
                <Card.Footer>
                  <Modal.Open opens={card.description}>
                    <button className="w-full bg-blue-500 py-2 text-sm text-white transition hover:bg-blue-600">
                      Add {card.description}
                    </button>
                  </Modal.Open>
                  <Modal.Window width="" key={index} name={card.description}>
                    <Modal.Header>
                      <h2 className="text-lg font-bold">
                        Add {card.description}
                      </h2>
                    </Modal.Header>
                    {card.modalComponent}
                  </Modal.Window>
                </Card.Footer>
              </Modal>
            </Card>
          </div>
        ))}

        {/* Chart below cards */}
        <div className="w-full rounded-md bg-white p-4 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Monthly Users
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
