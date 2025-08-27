import React from "react";
import CardListFlex from "../../../components/cards/cardlist";
import HolizontalButton from "../../../UI/horizontalButton";
import Table from "../../../components/table/table";
import Filter from "../../../components/filter/filter";
import StudentFee from "../../../features/studentFees/studentFee";

const sampleData = [
  { name: "Abdulhamid", role: "Developer" },
  { name: "Aisha", role: "Designer" },
  { name: "Bashir", role: "Manager" },
];

export default function StudentManagement() {
  const [tab, setTab] = React.useState(1);
  const [filtered, setFiltered] = React.useState(sampleData);

  const cards = [
    {
      id: 1,
      image: { src: "/images/edu.jpg", alt: "Education" },
      link: { href: "/learn", label: "Learn more" },
      title: "3000",
      description: "Students",
    },
    {
      id: 2,
      image: { src: "/images/tech.jpg", alt: "Technology" },
      link: { href: "/tech", label: "Discover" },
      title: "2000",
      description: "Undergraduate Students",
    },
    {
      id: 3,
      image: { src: "/images/science.jpg", alt: "Science" },
      link: { href: "/science", label: "Explore" },
      title: "500",
      description: "Postgraduate Students",
    },
    {
      id: 4,
      image: { src: "/images/science.jpg", alt: "Science" },
      link: { href: "/science", label: "Explore" },
      title: "500",
      description: "special education Students",
    },
  ];
  const data = [
    { label: "Admission", value: 1 },
    { label: "Student List", value: 2 },
    { label: "Student Attendance", value: 3 },
    { label: "Student Grades", value: 4 },
    { label: "Student Fees", value: 5 },
  ];

  return (
    <section className="flex flex-col gap-4 p-4 lg:flex-row">
      <section className="w-full">
        <CardListFlex cards={cards} />
        <div className="w-full">
          <HolizontalButton data={data} tab={tab} setTab={setTab} />
        </div>
        {tab === 1 && <AdminAdmission />}
        {tab === 2 && <StudentList />}
        {tab === 3 && <div className="p-4">Student Attendance Component</div>}
        {tab === 4 && <div className="p-4">Student Grades Component</div>}
        {tab === 5 && <StudentFee />}
      </section>
      <aside className="w-full lg:w-1/3">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <ul className="space-y-2">
            <li>
              <button className="w-full text-left">Add Student</button>
            </li>
            <li>
              <button className="w-full text-left">Remove Student</button>
            </li>
            <li>
              <button className="w-full text-left">Update Student Info</button>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  );
}



function AdminAdmission() {
  const admissionData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Pending" },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "Approved",
    },
  ];

  const filterOptions = [
    { label: "name", value: "name" },
    { label: "email", value: "email" },
    { label: "department", value: "department" },
    { label: "status", value: "status" },
  ];

  const [filtered, setFiltered] = React.useState(admissionData);
  const [filterKey, setFilterKey] = React.useState("status");

  const handleEdit = (id) => {
    console.log("Edit student with ID:", id);
  };
  const handleDelete = (id) => {
    console.log("Delete student with ID:", id);
  };

  return (
    <div className="p-4">
      <h1 className="py-2 text-3xl text-blue-600 uppercase">Admission</h1>

      <Filter
        data={admissionData}
        options={filterOptions}
        filterKey={filterKey}
        setFilterKey={setFilterKey}
        onFilter={setFiltered}
      />

      <Table data={filtered} className="min-w-full">
        <Table.Header columns={["Name", "Email", "Status", "Actions"]} />
        <Table.Body
          renderRow={(item) => (
            <>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.email}</td>
              <td className="px-4 py-2">{item.status}</td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(item.id)}
                >
                  Edit
                </button>
                <button
                  className="ml-2 text-red-600 hover:underline"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </>
          )}
        />
      </Table>
    </div>
  );
}

function StudentList() {
  const admissionData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Pending" },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "Approved",
    },
  ];

  const filterOptions = [
    { label: "name", value: "name" },
    { label: "email", value: "email" },
    { label: "department", value: "department" },
    { label: "status", value: "status" },
  ];

  const [filtered, setFiltered] = React.useState(admissionData);
  const [filterKey, setFilterKey] = React.useState("status");

  const handleEdit = (id) => {
    console.log("Edit student with ID:", id);
  };
  const handleDelete = (id) => {
    console.log("Delete student with ID:", id);
  };

  return (
    <div className="p-4">
      <h1 className="py-2 text-3xl text-blue-600 uppercase">Admission</h1>

      <Filter
        data={admissionData}
        options={filterOptions}
        filterKey={filterKey}
        setFilterKey={setFilterKey}
        onFilter={setFiltered}
      />

      <Table data={filtered} className="min-w-full">
        <Table.Header columns={["Name", "Email", "Status", "Actions"]} />
        <Table.Body
          renderRow={(item) => (
            <>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.email}</td>
              <td className="px-4 py-2">{item.status}</td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(item.id)}
                >
                  Edit
                </button>
                <button
                  className="ml-2 text-red-600 hover:underline"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </>
          )}
        />
      </Table>
    </div>
  );
}
