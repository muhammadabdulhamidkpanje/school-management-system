import React,{useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import pb from "../../../lib/pocketbase";

import Input from "../../../components/inputs/input";
import PrimaryButton from "../../../components/button/button";
import Headings from "../../../UI/headings";
import VerticalButton from "../../../UI/verticalButton";
import FileInput from "../../../UI/fileInput";


export default function InstitutionProfile (){
    const {register} = useForm()
    const [tab, setTab] = React.useState(1)
    return(
        <>
        <Headings className="text-xl font-semibold">Institutional settings</Headings>
         <div className="flex w-full flex-wrap justify-between gap-2">
            <VerticalButton tab={tab} className="" setTab={setTab} data={[{label:"Institution cards", value:1},{label:"Institution Information Edit", value:2}]} onClick={setTab} />
           <div className="sm:w-[73%] w-full sm:shadow p-4 shadow-xl ">
            {tab === 1 && <InstitutionCards />}
            {tab === 2 && <InstitutionInformationEdit />}
           </div>
           </div>
        </>
    )
}

function InstitutionCards() {
  const [cards, setCards] = React.useState([]);

  async function fetchInstitutionCards() {
    const records = await pb.collection("institutionalProfile").getFullList({
      sort: "-created",
    });
    setCards(records);
  }

  React.useEffect(() => {
    fetchInstitutionCards();
  }, []);

  return (
    <div className="p-6 w-full">
      <Headings className="text-lg font-semibold mb-6">
        Institution Cards
      </Headings>

      <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {card.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {card.address || "No address available"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {card.email || "No email provided"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {card.phone || "No phone number"}
              </p>
            </div>
            <div className="px-5 pb-4">
              <button className="w-full text-sm font-medium px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function InstitutionInformationEdit() {
    const {register, handleSubmit, formState:{isSubmitting, success}} = useForm()
    const data1 = useSelector((state)=> state.auth)

    const onSubmit = async (data, e) => {
        console.log(data)
        let Institution = {
            "name": data.institutionName,
            "email": data.institutionEmail,
            "address": data.institutionAddress,
            "phone": data.institutionPhone,
            "createdBy": data1.user.id
        }
        const record = await pb.collection('institutionalProfile').create(Institution);

        
    }
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


