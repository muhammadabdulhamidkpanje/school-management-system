import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "../../../lib/api";
import { getErrorMessage } from "../../../lib/apiError";
import { institutionProfileKeys } from "../../../lib/queryKeys";
import * as academicApi from "../../../features/academic/academicApi";
import Input from "../../../components/inputs/input";
import PrimaryButton from "../../../components/button/button";
import LoadingButton from "../../../components/button/loadingButton";
import Headings from "../../../UI/headings";

export default function InstitutionProfile() {
  const queryClient = useQueryClient();
  const [logo, setLogo] = React.useState(null);
  const profileQuery = useQuery({
    queryKey: institutionProfileKeys.all,
    queryFn: academicApi.getInstitutionProfile,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  React.useEffect(() => {
    if (!profileQuery.data) return;
    reset({
      name: profileQuery.data.name ?? "",
      email: profileQuery.data.email ?? "",
      address: profileQuery.data.address ?? "",
      phone: profileQuery.data.phone ?? "",
      latitude: profileQuery.data.latitude ?? "",
      longitude: profileQuery.data.longitude ?? "",
    });
  }, [profileQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async ({ logo: selectedLogo, ...payload }) => {
      let logoUrl = profileQuery.data?.logoUrl ?? null;
      if (selectedLogo) {
        const body = new FormData();
        body.append("file", selectedLogo);
        const { data } = await api.post("/api/v1/uploads", body);
        logoUrl = data.data.fileUrl;
      }
      return academicApi.updateInstitutionProfile({ ...payload, logoUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: institutionProfileKeys.all });
      setLogo(null);
      toast.success("Institution profile saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onSubmit = (values) =>
    saveMutation.mutate({
      logo,
      name: values.name.trim(),
      email: values.email || null,
      address: values.address || null,
      phone: values.phone || null,
      latitude: values.latitude === "" ? null : Number(values.latitude),
      longitude: values.longitude === "" ? null : Number(values.longitude),
    });

  if (profileQuery.isLoading) {
    return <p className="p-4">Loading institution profile...</p>;
  }

  if (profileQuery.isError) {
    return (
      <div className="p-4 text-red-700">
        <p>{getErrorMessage(profileQuery.error)}</p>
        <LoadingButton
          type="button"
          className="mt-2 underline"
          onClick={() => profileQuery.refetch()}
          isLoading={profileQuery.isFetching}
          loadingText="Retrying..."
        >
          Try again
        </LoadingButton>
      </div>
    );
  }

  return (
    <section>
      <Headings className="text-xl font-semibold">
        Institution profile
      </Headings>
      {profileQuery.data?.logoUrl && (
        <img
          src={profileQuery.data.logoUrl}
          alt="Institution logo"
          className="my-4 h-20 max-w-48 object-contain"
        />
      )}
      {profileQuery.data && (
        <div className="my-4 rounded border bg-gray-50 p-3 text-sm">
          <p className="font-semibold">{profileQuery.data.name}</p>
          <p>{profileQuery.data.address}</p>
          <p>{profileQuery.data.email}</p>
          <p>{profileQuery.data.phone}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <Input
          label="Institution name"
          name="name"
          placeholder="Institution name"
          register={register}
          rules={{ required: "Institution name is required" }}
          error={errors.name}
        />
        <div className="flex flex-wrap gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            className="min-w-48 flex-1"
            register={register}
            rules={{ pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" } }}
            error={errors.email}
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            className="min-w-48 flex-1"
            register={register}
          />
        </div>
        <Input
          label="Address"
          name="address"
          register={register}
        />
        <div className="flex flex-wrap gap-4">
          <Input label="Latitude" name="latitude" type="number" className="min-w-40 flex-1" register={register} />
          <Input label="Longitude" name="longitude" type="number" className="min-w-40 flex-1" register={register} />
        </div>
        <label className="mb-4 flex flex-col gap-2 text-sm font-semibold text-blue-600">
          Institution logo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
          />
          <span className="font-normal text-gray-500">JPEG, PNG, WEBP, or GIF; up to 20 MB</span>
        </label>
        <PrimaryButton
          type="submit"
          isLoading={saveMutation.isPending}
          loadingText="Saving..."
          className="w-full"
        >
          Save institution profile
        </PrimaryButton>
      </form>
    </section>
  );
}
