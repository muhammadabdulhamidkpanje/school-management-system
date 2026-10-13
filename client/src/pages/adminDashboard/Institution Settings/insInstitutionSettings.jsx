import React from "react";

import CardListFlex from "../../../components/cards/cardlist";
import HorizontalButton from "../../../UI/horizontalButton";
import { useDepartments } from "../../../features/departments/useDepartments";
import { useFaculties } from "../../../features/faculties/useFaculties";

import InstitutionProfile from "./institutionanProfile";
import AcademicSettings from "./academicSetting";
import FacultySettings from "./faculties";
import DepartmentSettings from "./department";



const buttonData = [{ label: "institution profile", value: 1 },{ label: "Academic settings", value: 2 }, { label: "Faculties", value: 3 }, { label: "Departments", value: 4 }];


export default function InstitutionSettings() {
    const [tab, setTab] = React.useState(1);
    const departmentsQuery = useDepartments({ page: 1, limit: 1 });
    const facultiesQuery = useFaculties({ page: 1, limit: 1 });
    const cards = [
      {
        title: departmentsQuery.data?.pagination?.total ?? "—",
        description: "departments",
      },
      {
        title: facultiesQuery.data?.pagination?.total ?? "—",
        description: "faculties",
      },
    ];

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




