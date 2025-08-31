import React, { useEffect } from "react";
import CardListFlex from "../../../components/cards/cardlist";
import HorizontalButton from "../../../UI/horizontalButton";
import Headings from "../../../UI/headings";
import VerticalButton from "../../../UI/verticalButton";
import { useForm } from "react-hook-form";
import Input from "../../../components/inputs/input";
import PrimaryButton from "../../../components/button/button";
import Table from "../../../components/table/table";
import { useSelector, useDispatch } from "react-redux";

import usePocketBase from "../../../../pocketbase/pocketbase";
import FileInput from "../../../components/inputs/fileInput";

const cards = [
    {title:"40", description: "department"},
    {title: "12", description: "faculties"}
]
const buttonData = [{ label: "institution profile", value: 1 },{ label: "Academic settings", value: 2 }, { label: "Faculties", value: 3 }, { label: "Departments", value: 4 }];
export default function InstitutionSettings() {
    const [tab, setTab] = React.useState(1);

  return (
    <section className="flex w-full p-4 gap-4">
      <section className="mb-4 w-[80%]">
        <CardListFlex cards={cards} />
        <HorizontalButton data={buttonData} className="w-full" tab={tab} setTab={setTab} onClick={setTab} />
        {tab === 1 && <InstitutionProfile />}
        {tab === 2 && <AcademicSettings />}
        {tab === 3 && <FacultySettings />}
        {tab === 4 && <DepartmentSettings />}
      </section>
    <aside className="bg-white shadow rounded p-4 w-[20%]">
    </aside>
    </section>
  );
}

function InstitutionProfile (){
    const {register} = useForm()
    const [tab, setTab] = React.useState(2)
    return(
        <>
        <Headings className="text-xl font-semibold">Institutional settings</Headings>
         <div className="flex w-full justify-between gap-2">
            <VerticalButton tab={tab} setTab={setTab} data={[{label:"Institution cards", value:1},{label:"Institution Information Edit", value:2}]} className="" onClick={setTab} />
           <div className="w-[75%] shadow p-4">
            {tab === 2 && <InstitutionInformationEdit />}
           </div>
           </div>
        </>
    )
}

function InstitutionInformationEdit() {
    const {register, handleSubmit, formState:{isSubmitting, success}} = useForm()
    const data1 = useSelector((state)=> state.auth)

    const onSubmit = (data, e) => {
        console.log(data1)
        
        
    }
    // useEffect((async()=>{

    //     onSubmit()
    // }))
    return(
        <>
        <Headings className="text-xl font-semibold">Institution Information Edit</Headings>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-4">
            <Input
                label={"Institution Name"}
                name="institutionName"
                placeholder="Enter institution name"
                register={register}
                className="w-[50%]"
            />  
            <Input
                label={"Institution Email"}
                name="institutionEmail"
                placeholder="Enter institution email"
                register={register}
                className="w-[50%]"
                type="email"
            />
            </div>
            <div className="flex gap-4">
            <Input
                label={"Institution Address"}
                name="institutionAddress"
                placeholder="Enter institution address"
                register={register}
                className="w-[50%]"
            />
            <Input
                label={"Institution Phone"}
                name="institutionPhone"
                placeholder="Enter institution phone"
                register={register}
                className="w-[50%]"
                type="tel"
            />
            </div>
            <div className="flex gap-4">
                <FileInput
                label="institution logo"
                name={"institution logo"}
                onChange={{}} />
                             
                
            </div>
            <PrimaryButton width="100%" className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
            </PrimaryButton>
        </form>

        </>
    )
}

const academicButtons = [{label: "Sessions", value: 1},{label: "Semesters", value: 2}, {label: "Grading Systems", value: 3}, {label: "Academic Calendars", value: 4}]
function AcademicSettings() {
    const [tab, setTab] = React.useState(1)
    return (
        <div className="p-4">
            <Headings className="text-xl font-semibold">Academic Settings</Headings>
           <div className="flex w-full justify-between gap-2">
            <VerticalButton data={academicButtons} className="" tab={tab} setTab={setTab} onClick={setTab} />
           <div className="w-[75%] shadow">
           {tab === 1 && <Sessions />}
           {tab === 2 && <GradingSystemsSettings />}
           {tab === 3 && <AcademicCalendarsSettings />}
           </div>
           </div>
        </div>

    )
}

function Sessions() {
    const [tab, setTab] = React.useState(1);
    return (
        <div className="p-4 w-full">
            <Headings className="text-sm font-semibold">Sessions Settings</Headings>
             <HorizontalButton tab={tab} setTab={setTab} onClick={setTab} data={[{label: "sessions views", value: 1}, {label: "Add session", value: 2}]} className="w-full" />    
            <div className="p-4">
                {tab === 1 && <SessionsViews />}
                {tab === 2 && <AddSession />}
            </div>
        </div>
    )
}

function SessionsViews() {
    return (
        <>
            <Headings className="text-sm font-semibold">Sessions Views</Headings>
            <div className="p-4">
                <Table data={[{sessionName: "2021/2022", sessionDate: "2021-09-01", numberOfSemesters: 2, status: "active"}, {sessionName: "2020/2021", sessionDate: "2020-09-01", numberOfSemesters: 2, status: "inactive"}]} className="">
                <Table.Header columns={["session name", "session date", "number of semester", "status"]}/>
                <Table.Body renderRow={({sessionName, sessionDate, numberOfSemesters, status}) => (
                       <>
                       <td>{sessionName}</td>
                       <td>{sessionDate}</td>
                       <td>{numberOfSemesters}</td>
                       <td>{status}</td>
                       </>
                )}>
                </Table.Body>
                </Table>
            </div>
        </>
    )
}

function AddSession() {
    const {handleSubmit, register, formState: {isSubmitting}} = useForm();
    return (
        <>
        <Headings>Add Session</Headings>
        <form action="" onSubmit={handleSubmit}>
            <div className="mb-4 flex w-full gap-2 flex-flow">
            <Input
                label={"Session Name"}
                name="sessionName"
                placeholder="Session Name"
                register={register}
                className="w-[50%]"
            
            />
            <Input
                label={"Session Date"}
                name="sessionDate"
                placeholder="Session Date"
                register={register}
                className="w-[50%]"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
            />         
            </div>
            <div className="mb-4 flex w-full gap-2 flex-flow">
                <Input
                    label="Number of Semesters"
                    name="numberOfSemesters"
                    placeholder="Number of Semesters"
                    register={register}
                    className="w-[50%]"
                />
                
            </div>
            <PrimaryButton width="100%" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</PrimaryButton>
        </form>
        </>
    )
}

function FacultySettings() {
    return (
        <div>
            <Headings className="text-xl font-semibold">Faculty Settings</Headings>
           
        </div>
    );
}

function DepartmentSettings() {
    return <div className="p-4">Department Settings Component</div>;
}
