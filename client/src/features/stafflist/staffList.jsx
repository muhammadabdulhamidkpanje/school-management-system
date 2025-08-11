import React from "react";
import Table from "../../components/table/table";

export default function StaffList() {


const staffData = [
  {
    name: "Alice",
    department: 17,
    position: "Teacher",
    phone: "123-456-7890",
    email: "alice@example.com",
  },
  {
    name: "Bob",
    department: 16,
    position: "Administrator",
    phone: "987-654-3210",
    email: "bob@example.com",
  },
  {
    name: "Alice",
    department: 17,
    position: "Teacher",
    phone: "123-456-7890",
    email: "alice@example.com",
  },
  {
    name: "Bob",
    department: 16,
    position: "Administrator",
    phone: "987-654-3210",
    email: "bob@example.com",
  },
];
    return (
    <section className="py-4">
    <h2 className="text-3xl uppercase text-blue-600 font-semibold mb-4">Staff List</h2>
      <Table data={staffData} className="rounded-lg border border-gray-300">
        <Table.Header
          columns={[
            "Name",
            "Department",
            "Position",
            "Phone",
            "Email",
            "Actions",
          ]}
        />
        <Table.Body
          renderRow={(staff) => (
            <>
              <td className="p-3">{staff.name}</td>
              <td className="p-3">{staff.department}</td>
              <td className="p-3">{staff.position}</td>
              <td className="p-3">{staff.phone}</td>
              <td className="p-3">{staff.email}</td>
              <td className="space-x-2 p-3">
                <button className="text-green-600 hover:underline">View</button>
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </>
          )}
        />
      </Table>
    </section>
    );
}