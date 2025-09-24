import React, { useEffect } from "react";

import CardListFlex from "../../../components/cards/cardlist";
import HorizontalButton from "../../../UI/horizontalButton";


import InstitutionProfile from "./institutionanProfile";
import AcademicSettings from "./academicSetting";
import FacultySettings from "./faculties";
import DepartmentSettings from "./department";



const cards = [
    {title:"40", description: "department"},
    {title: "12", description: "faculties"}
]
const buttonData = [{ label: "institution profile", value: 1 },{ label: "Academic settings", value: 2 }, { label: "Faculties", value: 3 }, { label: "Departments", value: 4 }];
export default function InstitutionSettings() {
    const [tab, setTab] = React.useState(1);

  return (
    <section className="flex w-full p-4 gap-4 flex-wrap">
      <section className="mb-4 w-full sm:w-[80%]">
        <CardListFlex cards={cards} />
        <HorizontalButton data={buttonData} className="" tab={tab} setTab={setTab} onClick={setTab} />
        {tab === 1 && <InstitutionProfile />}
        {tab === 2 && <AcademicSettings />}
        {tab === 3 && <FacultySettings />}
        {tab === 4 && <DepartmentSettings />}
      </section>
    <aside className="bg-white shadow rounded p-4 sm:w-[20%]">
    </aside>
    </section>
  );
}





