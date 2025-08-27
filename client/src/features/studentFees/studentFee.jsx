import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import HorizontalButton from "../../UI/horizontalButton";
import Input from "../../components/inputs/input";
import PrimaryButton from "../../components/button/button";
import FileInput from "../../UI/fileInput";
import Headings from "../../UI/headings";
import Card from "../../components/cards/cards";

// ✅ Yup schema
const schema = yup.object().shape({
  feeName: yup.string().required("Fee name is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than 0")
    .required("Amount is required"),
});

export default function StudentFee() {
  const [tab, setTab] = React.useState("add");

  return (
    <div>
      <Headings>Student Fees</Headings>
      <HorizontalButton
        tab={tab}
        setTab={setTab}
        data={[
          { label: "Add Fee", value: "add" },
          { label: "View Fees", value: "view" },
        ]}
        className="!w-1/4"
      />
      {tab === "add" && <StudentFeeForm />}
      {tab === "view" && <StudentFeeTable />}
    </div>
  );
}

function StudentFeeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema), // ✅ Yup validation
  });

  const [file, setFile] = React.useState(null);

  const onSubmit = (data) => {
    console.log("Form Submitted:", { ...data, feeImage: file });
    reset();
    setFile(null);
  };

  return (
    <div>
      <Headings>Add Fee</Headings>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex w-full justify-between">
          <div className="w-[48%]">
            <Input
              type="text"
              label="Fee Name"
              placeholder="Add a new fee"
              name="feeName"
              register={register}
            />
            {errors.feeName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.feeName.message}
              </p>
            )}
          </div>

          <div className="w-[48%]">
            <Input
              type="text"
              name="amount"
              label="Amount"
              placeholder="Add fee amount"
              register={register}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        {/* File Input not tied to RHF */}
        <FileInput
          accept="image/*"
          label="Upload Fee Image"
          id="feeImage"
          name="feeImage"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <PrimaryButton type="submit" className="!w-full">
          Add Fee
        </PrimaryButton>
      </form>
      <FeesCards />
    </div>
  );
}
function FeesCards() {
  const fees = [
    {
      image: { src: "/images/tuition.png", alt: "Tuition Fee" },
      name: "Tuition Fee",
      amount: 500,
    },
    {
      image: { src: "/images/library.png", alt: "Library Fee" },
      name: "Library Fee",
      amount: 200,
    },
    {
      image: { src: "/images/lab.png", alt: "Lab Fee" },
      name: "Lab Fee",
      amount: 150,
    },
    {
      image: { src: "/images/sports.png", alt: "Sports Fee" },
      name: "Sports Fee",
      amount: 100,
    },
  ];

  return (
    <>
      <Headings className="mb-4 text-lg">Fees Cards</Headings>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {fees.map((fee, idx) => (
          <Card
            key={idx}
            cardDetails={fee}
            className="w-full flex-col items-center rounded-xl bg-white p-3 shadow transition hover:shadow-md"
          >
            <Card.Image
              height="80px"
              width="80px"
              className="rounded-full object-cover"
            />
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">{fee.name}</p>
              <p className="text-xs text-gray-500">{`$${fee.amount}`}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}


function StudentFeeTable() {
  return (
    <div>
      <h2>Student Fee Table</h2>
    </div>
  );
}
