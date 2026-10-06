import React, { useState } from "react";
import Modal from "../../UI/modal";
import LocationPicker from "./locationPicker";
import Headings from "../../UI/headings";
import { MapPin } from "lucide-react";

export default function LocationComponent({ onLocationChange }) {
  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  return (
    <Modal>
      <Modal.Open opens="setLocation">
        <button
          type="button"
          className="mt-2 w-full rounded-lg bg-blue-400 p-2 text-center text-white hover:bg-blue-500"
        >
          Set location <MapPin className="inline-block ml-2" size={16} />
        </button>
      </Modal.Open>
      <Modal.Window name="setLocation" width="600px" height="300px">
        <Modal.Header>
          <Headings className="text-sm font-semibold">Set Institution Location</Headings>
        </Modal.Header>
        <div className="my-4">
          <LocationPicker
            latitude={coords.latitude}
            longitude={coords.longitude}
            onLocationChange={(newCoords) => {
              setCoords(newCoords);
              onLocationChange(newCoords);
            }}
          />
        </div>
        {coords.latitude && coords.longitude && (
            console.log(coords),
          <p className="mt-2 text-sm text-gray-600">
            Selected: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </p>
        )}
      </Modal.Window>
    </Modal>
  );
}
