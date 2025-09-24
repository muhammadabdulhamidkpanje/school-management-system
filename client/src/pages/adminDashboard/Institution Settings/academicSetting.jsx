import React, { use } from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "../../../components/button/button";
import Input from "../../../components/inputs/input";
import Headings from "../../../UI/headings";
import VerticalButton from "../../../UI/verticalButton";
import HorizontalButton from "../../../UI/horizontalButton";
import Table from "../../../components/table/table";
import pb from "../../../lib/pocketbase";
import Select from "../../../components/inputs/select";

const academicButtons = [
    {label: "Sessions", value: 1},
    {label: "Semesters", value: 2}, 
    {label: "Grading Systems", value: 3},
    {label: "Academic Calendars", value: 4}
]
export default function AcademicSettings() {
    const [tab, setTab] = React.useState(1)
    return (
        <div className="flex flex-wrap">
            <Headings className="text-xl w-full font-semibold">Academic Settings</Headings>
           <div className="flex w-full flex-wrap justify-between gap-2">
            <VerticalButton data={academicButtons} className="w-[24%] " tab={tab} setTab={setTab} onClick={setTab} />
           <div className="w-full sm:w-[73%] shadow">
           {tab === 1 && <Sessions />}
           {tab === 2 && <Semester />}
           {tab === 3 && <GradingSystemsSettings />}
           {tab === 4 && <AcademicCalendarsSettings />}
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
    const onSubmit = async (data) => {
        let record = await pb.collection('sessions').create(data);

    }

    return (
        <>
        <Headings>Add Session</Headings>
        <form action="" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 flex w-full gap-2 flex-flow">
            <Input
                label={"Session Name"}
                name="sessionName"
                placeholder="Session Name"
                register={register}
                className="w-[50%]"
            
            />
             <Input
                    label="Number of Semesters"
                    name="numberOfSemesters"
                    placeholder="Number of Semesters"
                    register={register}
                    className="w-[50%]"
                />
           
            </div>
            <div className="mb-4 flex w-full gap-2 flex-flow">
                <Input
                label={"Session Start Date"}
                name="sessionStartDate"
                placeholder="Session Start Date"
                register={register}
                className="w-[50%]"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
            />
                <Input
                label={"Session End Date"}
                name="sessionEndDate"
                placeholder="Session End Date"
                register={register}
                className="w-[50%]"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
            />
                
            </div>
            <PrimaryButton width="100%" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</PrimaryButton>
        </form>
        </>
    )
}


function Semester(){
    const [tab, setTab] = React.useState(1);
    return (
        <div className="p-4 w-full">
            <Headings className="text-sm font-semibold">semesters Managements</Headings>
             <HorizontalButton tab={tab} setTab={setTab} onClick={setTab} data={[{label: "semesters views", value: 1}, {label: "semester settings", value: 2}]} className="w-full" />    
            <div className="">
                {tab === 1 && <SemestersViews />}
                {tab === 2 && <SemesterSettings />}
            </div>
        </div>
    )
}



function SemestersViews(){
    return (
        <>
            <Headings className="text-sm font-semibold">Semesters Views</Headings>
            <div className="p-4">
                <Table data={[{semesterName: "First Semester", semesterDate: "2021-09-01", numberOfCourses: 5, status: "active"}, {semesterName: "Second Semester", semesterDate: "2021-12-01", numberOfCourses: 4, status: "inactive"}]} className="">
                <Table.Header columns={["semester name", "semester date", "number of courses", "status"]}/>
                <Table.Body renderRow={({semesterName, semesterDate, numberOfCourses, status}) => (
                       <>
                       <td>{semesterName}</td>
                       <td>{semesterDate}</td>
                       <td>{numberOfCourses}</td>
                       <td>{status}</td>
                       </>
                )}>
                </Table.Body>
                </Table>
            </div>
        </>
    )
}

function SemesterSettings(){
    const [tab, setTab] = React.useState(1);
    return (
        <>
            <Headings className="text-sm font-semibold">Semester Settings</Headings>
            <div className="flex justify-between gap-2 flex-wrap">
               <VerticalButton data={[{label: "Add Semester", value: 1}, {label: "Edit Semester", value: 2}]} className="w-[24%]" tab={tab} setTab={setTab} onClick={()=>{}} />
                <div className="w-full sm:w-[73%] ">
                    {tab === 1 && <AddSemester />}
                    {tab === 2 && <EditSemester />}
                </div>
            </div>
        </>
    )
}
function AddSemester(){
    const [sessions, setSessions] = React.useState([]);
    const {handleSubmit, register, formState: {isSubmitting}} = useForm();  
    const onSubmit = async (data) => {
        let record = await pb.collection('semesters').create(data);
    }   

    const GetSessionData = async () => {
    const records = await pb.collection('sessions').getFullList({
        sort: '-created',
    });

    console.log(records);

    setSessions(
        records.map((record) => ({
            label: record.sessionName,
            value: record.id
        }))
    );
};

console.log(sessions);
    React.useEffect(() => {
        GetSessionData();
    }, []);


    return (
        <>
        <Headings className="text-xl font-semibold">Add Semester</Headings>     
        <form action="" onSubmit={handleSubmit(onSubmit)}> 
            <Input
                label={"Semester Name"}
                name="semesterName"
                placeholder="Semester Name"
                register={register}
                className="w-[100%]"
                rules={{ required: "Semester name is required" }}
            />
            <div className="flex w-full gap-2 flex-flow">
            <Input
                label={"Semester Start Date"}
                name="semesterStartDate"
                placeholder="Semester Start Date"
                register={register}
                className="w-[50%]"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                rules={{ required: "Semester start date is required" }}
            />
            <Input
                label={"Semester End Date"}
                name="semesterEndDate"
                placeholder="Semester End Date"
                register={register}
                className="w-[50%]"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                rules={{ required: "Semester end date is required" }}
            />
            </div>
            <div className="flex w-full gap-2 flex-flow">          
            <Select
                options={sessions}
                label={"Session"}
                name="session"
                placeholder="Session"
                register={register}
                className="w-[70%]"
                rules={{ required: "Session is required" }}
            />
            <Select
                options={[{label: "Active", value: "true"}, {label: "Inactive", value: "false"}]}
                label={"Status"}
                name="status"
                placeholder="Status"
                register={register}
                className="w-[30%]"
                rules={{ required: "Status is required" }}
            />
            </div>
          
            <PrimaryButton width="100%" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</PrimaryButton>
        </form>
        </>
    )
}

function EditSemester(){
    return(
        <>
        </>
    )
}

function GradingSystemsSettings() {
    return(
        <>
        </>
    )
}




function AcademicCalendarsSettings() {
    return(
        <>
        </>
    )
}
