import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BikeRider, BikeRiderInput } from '../types/index';
import regions from '../context/data.json';

interface RiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rider: BikeRiderInput) => void;
  editRider?: BikeRider | null;
  error?: string;
  success?: string;
}

const RiderModal: React.FC<RiderModalProps> = ({ isOpen, onClose, onSubmit, editRider, error, success }) => {
  const [formData, setFormData] = useState<BikeRiderInput>({
    firstName: '',
    middleName: '',
    surname: '',
    gender: 'Male',
    phoneNumber: '',
    region: '',
    district: '',
    ward: '',
    village: '',
    bikeStation: '',
    bikeNumber: '',
    license: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BikeRider, string>>>({});
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (editRider) {
      const { _id, ...riderData } = editRider;
      setFormData(riderData);
      updateAvailableDistricts(riderData.region);
    }
  }, [editRider]);

  const updateAvailableDistricts = (regionName: string) => {
    const region = regions.regions.find(r => r.name === regionName);
    setAvailableDistricts(region?.districts || []);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BikeRider, string>> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.ward.trim()) newErrors.ward = 'Ward is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.bikeStation.trim()) newErrors.bikeStation = 'Bike station is required';
    if (!formData.bikeNumber.trim()) newErrors.bikeNumber = 'Bike number is required';
    if (!formData.license.trim()) newErrors.license = 'License is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'region') {
      updateAvailableDistricts(value);
      setFormData(prev => ({ ...prev, district: '' }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof BikeRider]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-4">{editRider ? 'Edit Rider' : 'Add New Rider'}</h2>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Surname</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.surname ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            {/* Location Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.region ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              >
                <option value="">Select Region</option>
                {regions.regions.map(region => (
                  <option key={region.name} value={region.name}>{region.name}</option>
                ))}
              </select>
              {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.district ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                disabled={!formData.region}
              >
                <option value="">Select District</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ward</label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.ward ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Village</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.village ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village}</p>}
            </div>

            {/* Bike Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Bike Station</label>
              <input
                type="text"
                name="bikeStation"
                value={formData.bikeStation}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.bikeStation ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.bikeStation && <p className="text-red-500 text-sm mt-1">{errors.bikeStation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bike Number</label>
              <input
                type="text"
                name="bikeNumber"
                value={formData.bikeNumber}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.bikeNumber ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.bikeNumber && <p className="text-red-500 text-sm mt-1">{errors.bikeNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">License</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
                className={`mt-1 block w-full rounded border ${errors.license ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
              />
              {errors.license && <p className="text-red-500 text-sm mt-1">{errors.license}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editRider ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RiderModal;
