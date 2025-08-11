import React, { useState } from "react";
import PrimaryButton from "../../components/button/button";
import Table from "../../components/table/table";

// Sample staff list
const staffList = [
  { id: "001", name: "Mrs. Amina Yusuf" },
  { id: "002", name: "Dr. Abdulrahman Idris" },
];

export default function StaffAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const handleAttendanceSubmit = async (records) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = records.map((r) => ({ ...r, date: today }));
    setAttendanceRecords((prev) => [...prev, ...updated]);

    try {
      await fetch("/api/staff/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("Error submitting attendance:", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h2 className="mb-4 text-xl font-bold">Staff Attendance</h2>
      <AttendanceForm staffList={staffList} onSubmit={handleAttendanceSubmit} />
      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Attendance Records</h3>
        <AttendanceTable attendanceData={attendanceRecords} />
      </div>
    </div>
  );
}

function AttendanceForm({ staffList, onSubmit }) {
  const [attendance, setAttendance] = useState(
    staffList.map((staff) => ({
      staffId: staff.id,
      name: staff.name,
      status: "Present",
      checkInTime: "",
      checkOutTime: "",
    })),
  );

  const handleChange = (index, field, value) => {
    const updated = [...attendance];
    updated[index][field] = value;
    setAttendance(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = attendance.every(
      (a) =>
        a.status !== "Present" ||
        (a.checkInTime.trim() && a.checkOutTime.trim()),
    );

    if (!isValid) {
      alert("Please fill check-in and check-out times for all Present staff.");
      return;
    }

    onSubmit(attendance);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {attendance.map((staff, i) => (
        <div
          key={staff.staffId}
          className="flex items-center gap-2 rounded border p-2"
        >
          <span className="w-1/4 font-semibold">{staff.name}</span>
          <select
            value={staff.status}
            onChange={(e) => handleChange(i, "status", e.target.value)}
            className="rounded border p-1"
          >
            <option>Present</option>
            <option>Absent</option>
            <option>Leave</option>
          </select>
          <input
            type="time"
            value={staff.checkInTime}
            onChange={(e) => handleChange(i, "checkInTime", e.target.value)}
            className="rounded border p-1"
            disabled={staff.status !== "Present"}
          />
          <input
            type="time"
            value={staff.checkOutTime}
            onChange={(e) => handleChange(i, "checkOutTime", e.target.value)}
            className="rounded border p-1"
            disabled={staff.status !== "Present"}
          />
        </div>
      ))}
      <PrimaryButton type="submit" className="mt-4">
        Submit Attendance
      </PrimaryButton>
    </form>
  );
}

function AttendanceTable({ attendanceData }) {
  if (!attendanceData.length)
    return <p className="text-sm text-gray-500">No attendance data yet.</p>;

  return (
    <Table data={attendanceData} className="overflow-hidden rounded shadow-lg">
      <Table.Header
        columns={["Name", "Date", "Status", "Check-In", "Check-Out"]}
      />
      <Table.Body
        renderRow={(row, index) => (
          <>
            <td className="p-2">{row.name}</td>
            <td className="p-2">{row.date}</td>
            <td className="p-2">
              <span
                className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                  row.status === "Present"
                    ? "bg-green-100 text-green-800"
                    : row.status === "Absent"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {row.status}
              </span>
            </td>
            <td className="p-2">{row.checkInTime || "-"}</td>
            <td className="p-2">{row.checkOutTime || "-"}</td>
          </>
        )}
      />
    </Table>
  );
}
