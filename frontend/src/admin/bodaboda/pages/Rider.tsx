import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEdit, FaTrash, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import config from '../../../config/config';
import { BikeRider } from '../../../types';
import RiderSkeleton from '../components/RiderSkeleton';
import { exportRidersToPDF } from '../../../config/pdfExporter';
import locationData from '../../../context/data.json';

interface FilterState {
  search: string;
  region: string;
  district: string;
  ward: string;
  bikeStation: string;
}

interface DeleteConfirmation {
  isOpen: boolean;
  riderId: string;
  license: string;
  inputLicense: string;
}

interface SortState {
  field: 'name' | 'updatedAt';
  direction: 'asc' | 'desc';
}

interface BikeRiderForm {
  firstName: string;
  middleName: string;
  surname: string;
  phoneNumber: string;
  gender: 'Male' | 'Female';
  region: string;
  district: string;
  ward: string;
  village: string;
  bikeStation: string;
  bikeNumber: string;
  license: string;
}

const initialFormState: BikeRiderForm = {
  firstName: '',
  middleName: '',
  surname: '',
  phoneNumber: '',
  gender: 'Male',
  region: '',
  district: '',
  ward: '',
  village: '',
  bikeStation: '',
  bikeNumber: '',
  license: ''
};

const ITEMS_PER_PAGE = 10;

const Rider: React.FC = () => {
  const [riders, setRiders] = useState<BikeRider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<BikeRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    region: '',
    district: '',
    ward: '',
    bikeStation: '',
  });
  const [sort, setSort] = useState<SortState>({
    field: 'name',
    direction: 'asc'
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRider, setNewRider] = useState<BikeRiderForm>(initialFormState);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmation>({
    isOpen: false,
    riderId: '',
    license: '',
    inputLicense: ''
  });
  const [editRider, setEditRider] = useState<BikeRider | null>(null);
  const [viewRider, setViewRider] = useState<BikeRider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        ...filters,
        sortField: sort.field,
        sortDirection: sort.direction
      });

      const response = await fetch(`${config.apiUrl}/api/admin/riders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch riders');
      }

      const data = await response.json();
      const ridersList = Array.isArray(data) ? data : data.riders || [];
      setRiders(ridersList);
      setFilteredRiders(ridersList);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load riders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load riders. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, [currentPage, filters, sort]);

  useEffect(() => {
    let filtered = [...riders];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(rider => 
        (rider.firstName?.toLowerCase().includes(searchTerm)) ||
        (rider.surname?.toLowerCase().includes(searchTerm)) ||
        (rider.license?.toLowerCase().includes(searchTerm)) ||
        (rider.bikeNumber?.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.region) {
      filtered = filtered.filter(rider => 
        rider.region?.toLowerCase() === filters.region.toLowerCase()
      );
    }

    if (filters.district) {
      filtered = filtered.filter(rider => 
        rider.district?.toLowerCase() === filters.district.toLowerCase()
      );
    }

    if (filters.ward) {
      filtered = filtered.filter(rider => 
        rider.ward?.toLowerCase() === filters.ward.toLowerCase()
      );
    }

    if (filters.bikeStation) {
      filtered = filtered.filter(rider => 
        rider.bikeStation?.toLowerCase() === filters.bikeStation.toLowerCase()
      );
    }

    setFilteredRiders(filtered);
  }, [riders, filters]);

  const handleDeleteRider = async (riderId: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/admin/riders/${riderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete rider');
      }

      setRiders(riders.filter(rider => rider._id !== riderId));
      setFilteredRiders(filteredRiders.filter(rider => rider._id !== riderId));
      setDeleteConfirm({ isOpen: false, riderId: '', license: '', inputLicense: '' });
    } catch (err) {
      console.error('Failed to delete rider:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete rider. Please try again.');
    }
  };

  const handleDeleteClick = (rider: BikeRider) => {
    setDeleteConfirm({
      isOpen: true,
      riderId: rider._id,
      license: rider.license,
      inputLicense: ''
    });
  };

  const exportToPDF = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const exportedBy = `${userData.name || 'Unknown'} (${userData.position || 'Unknown'})`;
    exportRidersToPDF(filteredRiders, exportedBy);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    const data = filteredRiders.map(rider => ({
      'First Name': rider.firstName,
      'Middle Name': rider.middleName || '',
      'Surname': rider.surname,
      'Gender': rider.gender,
      'Phone Number': rider.phoneNumber,
      'Region': rider.region,
      'District': rider.district,
      'Ward': rider.ward,
      'Village': rider.village,
      'Bike Station': rider.bikeStation,
      'Bike Number': rider.bikeNumber,
      'License': rider.license,
      'Last Modified': new Date(rider.updatedAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riders');
    XLSX.writeFile(workbook, 'riders-report.xlsx');
  };

  const sortedRiders = [...filteredRiders].sort((a, b) => {
    if (sort.field === 'name') {
      const nameA = `${a.firstName} ${a.surname}`.toLowerCase();
      const nameB = `${b.firstName} ${b.surname}`.toLowerCase();
      return sort.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sort.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRiders = sortedRiders.slice(startIndex, endIndex);

  const handleAddRider = async () => {
    try {
      setError(null);
      const response = await fetch(`${config.apiUrl}/api/admin/riders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newRider)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add rider');
      }

      const addedRider = await response.json();
      setRiders(prev => [...prev, addedRider]);
      setIsAddModalOpen(false);
      setNewRider(initialFormState);
      fetchRiders();
    } catch (err) {
      console.error('Failed to add rider:', err);
      setError(err instanceof Error ? err.message : 'Failed to add rider. Please try again.');
    }
  };

  const isFormValid = () => {
    return (
      newRider.firstName &&
      newRider.surname &&
      newRider.phoneNumber &&
      newRider.region &&
      newRider.district &&
      newRider.ward &&
      newRider.village &&
      newRider.bikeStation &&
      newRider.bikeNumber &&
      newRider.license
    );
  };

  const updateAvailableDistricts = (regionName: string) => {
    if (!regionName) {
      setAvailableDistricts([]);
      return;
    }

    const selectedRegion = locationData.regions.find(r => r.name === regionName);
    if (selectedRegion) {
      setAvailableDistricts(selectedRegion.districts);
    } else {
      setAvailableDistricts([]);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionName = e.target.value;
    updateAvailableDistricts(regionName);
    setNewRider(prev => ({ ...prev, region: regionName, district: '' }));
  };

  const handleUpdate = async (riderId: string, updatedData: Partial<BikeRider>) => {
    try {
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}${config.adminEndpoints.updateRider(riderId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update rider');
      }

      const data = await response.json();
      if (data.success) {
        setEditRider(null);
        fetchRiders(); // Refresh the riders list
        console.log('Rider updated successfully');
      }
    } catch (error) {
      console.error('Error updating rider:', error);
      setError(error instanceof Error ? error.message : 'Failed to update rider');
    }
  };

  if (loading) {
    return <RiderSkeleton />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r"
        >
          {error}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end items-center mb-6"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToExcel}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <FaDownload /> Export Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportToPDF}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <FaDownload /> Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            Add Rider
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, license, or bike number..."
              className="pl-10 w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <select
            value={filters.region}
            onChange={(e) => {
              const regionName = e.target.value;
              updateAvailableDistricts(regionName);
              setFilters(prev => ({ ...prev, region: regionName, district: '' }));
            }}
            className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
          >
            <option value="">All Regions</option>
            {locationData.regions.map(region => (
              <option key={region.name} value={region.name}>{region.name}</option>
            ))}
          </select>
          <select
            value={filters.district}
            onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
            className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            disabled={!filters.region}
          >
            <option value="">All Districts</option>
            {availableDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <select
            value={filters.ward}
            onChange={(e) => setFilters(prev => ({ ...prev, ward: e.target.value }))}
            className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
          >
            <option value="">All Wards</option>
            {[...new Set(riders.map(r => r.ward))].map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
          <select
            value={filters.bikeStation}
            onChange={(e) => setFilters(prev => ({ ...prev, bikeStation: e.target.value }))}
            className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
          >
            <option value="">All Bike Stations</option>
            {[...new Set(riders.map(r => r.bikeStation))].map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                S/N
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedRiders.map((rider, index) => (
                <motion.tr
                  key={rider._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {`${rider.firstName} ${rider.middleName || ''} ${rider.surname}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rider.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rider.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rider.license}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setViewRider(rider)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      >
                        <FaEye className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditRider(rider)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                      >
                        <FaEdit className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(rider)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        <FaTrash className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Rider</h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewRider(initialFormState);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                <input
                  type="text"
                  value={newRider.firstName}
                  onChange={(e) => setNewRider(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First Name"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={newRider.middleName}
                  onChange={(e) => setNewRider(prev => ({ ...prev, middleName: e.target.value }))}
                  placeholder="Middle Name"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname*</label>
                <input
                  type="text"
                  value={newRider.surname}
                  onChange={(e) => setNewRider(prev => ({ ...prev, surname: e.target.value }))}
                  placeholder="Surname"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                <input
                  type="tel"
                  value={newRider.phoneNumber}
                  onChange={(e) => setNewRider(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Phone Number"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                <select
                  value={newRider.gender}
                  onChange={(e) => setNewRider(prev => ({ ...prev, gender: e.target.value as 'Male' | 'Female' }))}
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region*</label>
                <select
                  value={newRider.region}
                  onChange={handleRegionChange}
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Region</option>
                  {locationData.regions.map(region => (
                    <option key={region.name} value={region.name}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District*</label>
                <select
                  value={newRider.district}
                  onChange={(e) => setNewRider(prev => ({ ...prev, district: e.target.value }))}
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!newRider.region}
                >
                  <option value="">Select District</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward*</label>
                <input
                  type="text"
                  value={newRider.ward}
                  onChange={(e) => setNewRider(prev => ({ ...prev, ward: e.target.value }))}
                  placeholder="Ward"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village*</label>
                <input
                  type="text"
                  value={newRider.village}
                  onChange={(e) => setNewRider(prev => ({ ...prev, village: e.target.value }))}
                  placeholder="Village"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bike Station*</label>
                <input
                  type="text"
                  value={newRider.bikeStation}
                  onChange={(e) => setNewRider(prev => ({ ...prev, bikeStation: e.target.value }))}
                  placeholder="Bike Station"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bike Number*</label>
                <input
                  type="text"
                  value={newRider.bikeNumber}
                  onChange={(e) => setNewRider(prev => ({ ...prev, bikeNumber: e.target.value }))}
                  placeholder="Bike Number"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License*</label>
                <input
                  type="text"
                  value={newRider.license}
                  onChange={(e) => setNewRider(prev => ({ ...prev, license: e.target.value }))}
                  placeholder="License"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewRider(initialFormState);
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRider}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!isFormValid()}
              >
                Add Rider
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {viewRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Rider Details</h3>
              <button
                onClick={() => setViewRider(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Full Name:</span> {`${viewRider.firstName} ${viewRider.middleName || ''} ${viewRider.surname}`}</p>
                  <p><span className="text-gray-500">Phone:</span> {viewRider.phoneNumber}</p>
                  <p><span className="text-gray-500">Gender:</span> {viewRider.gender}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Location</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Region:</span> {viewRider.region}</p>
                  <p><span className="text-gray-500">District:</span> {viewRider.district}</p>
                  <p><span className="text-gray-500">Ward:</span> {viewRider.ward}</p>
                  <p><span className="text-gray-500">Village:</span> {viewRider.village}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Bike Information</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Station:</span> {viewRider.bikeStation}</p>
                  <p><span className="text-gray-500">Bike Number:</span> {viewRider.bikeNumber}</p>
                  <p><span className="text-gray-500">License:</span> {viewRider.license}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Additional Information</h4>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Created:</span> {new Date(viewRider.createdAt).toLocaleString()}</p>
                  <p><span className="text-gray-500">Last Updated:</span> {new Date(viewRider.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewRider(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-4">Edit Rider</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (editRider) {
                const updatedData = {
                  firstName: editRider.firstName,
                  middleName: editRider.middleName,
                  surname: editRider.surname,
                  gender: editRider.gender,
                  phoneNumber: editRider.phoneNumber,
                  region: editRider.region,
                  district: editRider.district,
                  ward: editRider.ward,
                  village: editRider.village,
                  bikeStation: editRider.bikeStation,
                  bikeNumber: editRider.bikeNumber,
                  license: editRider.license
                };
                await handleUpdate(editRider._id, updatedData);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editRider.firstName}
                    onChange={(e) => setEditRider({...editRider, firstName: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={editRider.middleName}
                    onChange={(e) => setEditRider({...editRider, middleName: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                  <input
                    type="text"
                    value={editRider.surname}
                    onChange={(e) => setEditRider({...editRider, surname: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editRider.phoneNumber}
                    onChange={(e) => setEditRider({...editRider, phoneNumber: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={editRider.gender}
                    onChange={(e) => setEditRider({...editRider, gender: e.target.value as 'Male' | 'Female'})}
                    className="border rounded-lg px-4 py-2 w-full"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={editRider.region}
                    onChange={(e) => {
                      updateAvailableDistricts(e.target.value);
                      setEditRider({...editRider, region: e.target.value});
                    }}
                    className="border rounded-lg px-4 py-2 w-full"
                  >
                    <option value="">Select Region</option>
                    {locationData.regions.map(region => (
                      <option key={region.name} value={region.name}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    value={editRider.district}
                    onChange={(e) => setEditRider({...editRider, district: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                  <input
                    type="text"
                    value={editRider.ward}
                    onChange={(e) => setEditRider({...editRider, ward: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={editRider.village}
                    onChange={(e) => setEditRider({...editRider, village: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Station</label>
                  <input
                    type="text"
                    value={editRider.bikeStation}
                    onChange={(e) => setEditRider({...editRider, bikeStation: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Number</label>
                  <input
                    type="text"
                    value={editRider.bikeNumber}
                    onChange={(e) => setEditRider({...editRider, bikeNumber: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License</label>
                  <input
                    type="text"
                    value={editRider.license}
                    onChange={(e) => setEditRider({...editRider, license: e.target.value})}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditRider(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Please enter the rider's license number to confirm deletion:</p>
            <p className="text-sm text-gray-500 mb-4">License: {deleteConfirm.license}</p>
            <input
              type="text"
              value={deleteConfirm.inputLicense}
              onChange={(e) => setDeleteConfirm(prev => ({ ...prev, inputLicense: e.target.value }))}
              placeholder="Enter license number"
              className="border rounded-lg px-4 py-2 w-full mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, riderId: '', license: '', inputLicense: '' })}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.inputLicense === deleteConfirm.license) {
                    handleDeleteRider(deleteConfirm.riderId);
                  }
                }}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                disabled={deleteConfirm.inputLicense !== deleteConfirm.license}
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRiders.length)} of {filteredRiders.length} entries
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 transition-all duration-200"
          >
            Previous
          </motion.button>
          {[...Array(Math.ceil(filteredRiders.length / ITEMS_PER_PAGE))].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredRiders.length / ITEMS_PER_PAGE), p + 1))}
            disabled={currentPage === Math.ceil(filteredRiders.length / ITEMS_PER_PAGE)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 transition-all duration-200"
          >
            Next
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Rider;