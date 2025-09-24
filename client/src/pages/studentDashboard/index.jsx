import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  FileText,
  User,
} from "lucide-react";


import Card from "../../UI/cards";

const cardsDetails = [
    {
      title: "Attendance",
      description: "80%",
      image: <CalendarCheck size={60} />,
    },
    {
      title: "Payment",
      description: "3/5",
      image: <CreditCard size={40} /> ,
    },
    {
      title: "Attendance",
      description: "80%",
      image: <FileText size={40} />,
    },
    
  ];


export default function StudentDashboard() {
  
  return (
    <div className="h-full flex flex-auto">
      <div>
      <div className="flex flex-wrap gap-8 justify-start items-center p-4">
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
