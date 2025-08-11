import React from "react";

import Card from "../../UI/cards";


export default function StudentDashboard() {
  const cardsDetails = [
    {
      title: "Attendance",
      description: "80%",
      image: "https://via.placeholder.com/150",
    },
    {
      title: "Payment",
      description: "3/5",
      image: "https://via.placeholder.com/150",
    },
    {
      title: "Attendance",
      description: "80%",
      image: "https://via.placeholder.com/150",
    },
    {
      title: "Payment",
      description: "3/5",
      image: "https://via.placeholder.com/150",
    },
    {
      title: "Attendance",
      description: "80%",
      image: "https://via.placeholder.com/150",
    },
    {
      title: "Payment",
      description: "3/5",
      image: "https://via.placeholder.com/150",
    },
  ];
  return (
    <div className="h-full flex flex-auto">
      <div>

      <h1>Student Dashboard</h1>
      <div className="flex flex-wrap gap-4 justify-between items-center p-4">
        {cardsDetails.map((card, index) => (
          <Card key={index} {...card} className="bg-white justify-center w-40 h-30 shadow-md rounded-md p-4" />
        ))}
      </div>
    </div>
    <div className="w-[30%]" >

    </div>
    </div>
  );
}
