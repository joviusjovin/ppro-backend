import React, { useState, useEffect } from "react";
import data from "../context/data.json";
import { useLanguage } from '../context/LanguageContext';



interface BikeRiderFormProps {
  onClose: () => void;
}

const BikeRiderForm: React.FC<BikeRiderFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    surname: "",
    gender: "",
    region: "",
    district: "",
    ward: "",
    village: "",
    phoneNumber: "",
    bikeStation: "",
    bikeNumber: "",
    license: "",
  });
  
  const { t } = useLanguage();
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [message, setMessage] = useState(""); // Popup message
  const [popupType, setPopupType] = useState<"success" | "error">(); // Type of popup (success or error)

  useEffect(() => {
    // Update available districts when a region is selected
    const regionData = data.regions.find((region) => region.name === formData.region);
    setAvailableDistricts(regionData ? regionData.districts : []);
    setFormData((prevState) => ({ ...prevState, district: "" })); // Reset district
  }, [formData.region]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Remove non-digit characters for phone number
    if (name === "phoneNumber") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prevState) => ({ ...prevState, [name]: numericValue }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const isValidForm = () => {
    const requiredFields = ["firstName", "surname", "phoneNumber"];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        setPopupType("error"); // Set error type
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm()) return;

    fetch("https://ppro-backend.onrender.com/api/bikeriders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || t('failData'));
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Saved data:", data);
        setMessage(t('dataSuccess'));
        setPopupType("success"); // Set success type
        setTimeout(() => {
          setMessage(""); // Clear message after 4 seconds
          onClose(); // Close the form
        }, 3000);
      })
      .catch((error) => {
        // Handle duplicate license error
        if (error.message.includes("License already exists")) {
          setMessage(t('licenseExists'));
        } else {
          setMessage(error.message || "An error occurred.");
        }
        setPopupType("error"); // Set error type
        setTimeout(() => setMessage(""), 3000); // Clear message after 4 seconds
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Popup */}
      {message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 ease-in-out ${
            popupType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white p-10 rounded-lg w-11/12 max-w-xl max-h-[85vh] overflow-auto flex flex-col text-gray-600">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t('bodaInfo')}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('firstName')}</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('middleName')}</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('surName')}</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('gender')}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            >
              <option value="">{t('selectGender')}</option>
              <option value="Male">{t('male')}</option>
              <option value="Female">{t('female')}</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('region')}</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            >
              <option value="">{t('selectRegion')}</option>
              {data.regions.map((region) => (
                <option key={region.name} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('district')}</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
              disabled={!formData.region}
            >
              <option value="">{t('selectDistrict')}</option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('ward')}</label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('village')}</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('phoneNumber')}</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('bikeStation')}</label>
            <input
              type="text"
              name="bikeStation"
              value={formData.bikeStation}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('bikeNumber')}</label>
            <input
              type="text"
              name="bikeNumber"
              value={formData.bikeNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('license')}</label>
            <input
              type="text"
              name="license"
              value={formData.license}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
            >
              {t('submit')}
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg w-full"
        >
         {t('close')}
        </button>
      </div>
    </div>
  );
};

export default BikeRiderForm;
