import React from "react";
import CardListFlex from "../../../components/cards/cardlist";
import HolizontalButton from "../../../UI/horizontalButton";
import VerticalButton from "../../../UI/verticalButton";
import Table from "../../../components/table/table";
import Filter from "../../../components/filter/filter";
import Headings from "../../../UI/headings";


const attendanceButtons = [
  { value: 1, label: "Attendance View" },
  { value: 2, label: "Attendance Settings" },
];
export default function StudentAttendance() {
    const [tab, setTab] = React.useState(1);
  return (
    <div className="flex flex-wrap">
      <Headings className="w-full text-xl font-semibold">
        Student Attendance
      </Headings>
      <div className="flex w-full flex-wrap justify-between gap-2">
        <VerticalButton
          data={attendanceButtons}
          className="w-[24%]"
          tab={tab}
          setTab={setTab}
        />
        <div className="w-full shadow sm:w-[73%]">
          {tab === 1 && (
            <div className="p-4">
              <HolizontalButton data={attendanceButtons} tab={tab} setTab={setTab} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
