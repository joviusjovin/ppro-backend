import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaTrash, FaCheck, FaTimes, FaDownload, FaEdit, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import config from '../../../config/config';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LeadershipCapacityForm from '../../../components/LeadershipCapacityForm';
import { registerTimesNewRoman } from '../../utils/fontLoader';

interface Registration {
  _id: string;
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  phone: string;
  experience: string;
  leadershipGoals: string;
  additionalComments?: string;
  registrationDate: string;
  status?: 'pending' | 'accepted' | 'rejected';
  gender: string;
  region: string;
  district: string;
  ward: string;
}

const ManageRegistrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewRegistration, setViewRegistration] = useState<Registration | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editRegistration, setEditRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; isOpen: boolean } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations...');
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}/api/admin/leadership-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Fetched data:', data);

      if (data.success) {
        setRegistrations(data.data);
      } else {
        console.error('Failed to fetch registrations:', data.message);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}${config.adminEndpoints.leadershipRegistrations.delete(id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete registration');
      }

      const data = await response.json();
      if (data.success) {
        setDeleteConfirmation(null);
        fetchRegistrations();
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete registration');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}/api/admin/leadership-registrations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        fetchRegistrations();
      } else {
        console.error('Failed to update status:', data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdate = async (id: string, updatedData: Partial<Registration>) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}/api/admin/leadership-registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update registration');
      }

      const data = await response.json();
      if (data.success) {
        setEditRegistration(null);
        fetchRegistrations();
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      setError(error instanceof Error ? error.message : 'Failed to update registration');
    }
  };

  const exportToPDF = async () => {
    // Get admin info from local storage
    const adminFullName = localStorage.getItem('adminFullName') || 'Unknown User';
    const adminPosition = localStorage.getItem('adminPosition') || 'Unknown Position';

    // Create landscape PDF
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'pt',
      format: 'a4'
    });

    // Register Times New Roman font
    await registerTimesNewRoman(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    const margin = 40;

    // Add logo on left side
    const logoUrl = 'https://i.ibb.co/W4d75rND/logo-ppro-01-H-CEl6-OB.png';
    doc.addImage(logoUrl, 'PNG', margin, 20, 80, 60);

    // Set Times New Roman as default font
    doc.setFont('TimesNewRoman');

    // Add header text (right of logo)
    doc.setFontSize(18);
    doc.setFont('TimesNewRoman', 'bold');
    doc.text("PARTNERSHIP FOR POVERTY REDUCTION ORGANISATION", margin + 100, 50);
    
    // Centered subtitle
    doc.setFontSize(14);
    doc.setFont('TimesNewRoman', 'normal');
    doc.text("Leadership Capacity Building Registrations Report", centerX, 80, { align: 'center' });

    // Prepare table data
    const tableColumns = [
      { header: "S/N", dataKey: "sn" },
      { header: "Full Name", dataKey: "name" },
      { header: "Gender", dataKey: "gender" },
      { header: "Phone", dataKey: "phone" },
      { header: "Email", dataKey: "email" },
      { header: "Region", dataKey: "region" },
      { header: "Experience", dataKey: "experience" },
      { header: "Status", dataKey: "status" }
    ];

    const tableData = registrations.map((reg, index) => ({
      sn: (index + 1).toString(),
      name: `${reg.firstName} ${reg.middleName || ''} ${reg.surname}`.trim(),
      gender: reg.gender,
      phone: reg.phone,
      email: reg.email,
      region: reg.region,
      experience: reg.experience,
      status: reg.status || 'pending'
    }));

    // Define column styles with left alignment for both header and body
    const columnStyles = {
      sn: { cellWidth: 40, halign: 'left' as const, headHalign: 'left' as const },
      name: { cellWidth: 'auto' as const, halign: 'left' as const, headHalign: 'left' as const },
      gender: { cellWidth: 50, halign: 'left' as const, headHalign: 'left' as const },
      phone: { cellWidth: 90, halign: 'left' as const, headHalign: 'left' as const },
      email: { cellWidth: 120, halign: 'left' as const, headHalign: 'left' as const },
      region: { cellWidth: 'auto' as const, halign: 'left' as const, headHalign: 'left' as const },
      experience: { cellWidth: 80, halign: 'left' as const, headHalign: 'left' as const },
      status: { cellWidth: 70, halign: 'left' as const, headHalign: 'left' as const }
    };

    // Add table with alternating row colors
    autoTable(doc, {
      columns: tableColumns,
      body: tableData,
      startY: 100,
      margin: { horizontal: margin },
      styles: { 
        font: 'TimesNewRoman',
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
        valign: 'middle',
        lineWidth: 0,
        textColor: [0, 0, 0]
      },
      headStyles: {
        font: 'TimesNewRoman',
        fontStyle: 'bold',
        fillColor: [70, 130, 180], // Steel blue header
        textColor: [255, 255, 255], // White text
        lineWidth: 0
      },
      bodyStyles: {
        font: 'TimesNewRoman',
        lineWidth: 0
      },
      alternateRowStyles: {
        font: 'TimesNewRoman',
        fillColor: [240, 240, 240] // Light gray for alternate rows
      },
      columnStyles: columnStyles,
      theme: 'plain',
      didParseCell: (data) => {
        if (data.cell.raw) {
          data.cell.text = [data.cell.raw.toString()];
        }
      }
    });

    // Add footer with admin info
    const pageHeight = doc.internal.pageSize.height;
    doc.setFont('TimesNewRoman');
    doc.setFontSize(10);
    
    const exportDate = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const footerText = `Exported by: ${adminFullName} (${adminPosition}) | ${exportDate}`;
    
    doc.text(
      footerText,
      centerX, 
      pageHeight - 20, 
      { align: 'center' }
    );

    // Save the PDF
    doc.save('leadership-registrations-report.pdf');
  };

  const exportToExcel = () => {
    const data = registrations.map(reg => ({
      'Name': `${reg.firstName} ${reg.middleName || ''} ${reg.surname}`.trim(),
      'Email': reg.email,
      'Phone': reg.phone,
      'Gender': reg.gender,
      'Region': reg.region,
      'District': reg.district,
      'Ward': reg.ward,
      'Experience': reg.experience,
      'Leadership Goals': reg.leadershipGoals,
      'Status': reg.status || 'pending',
      'Registration Date': new Date(reg.registrationDate).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    XLSX.writeFile(wb, 'leadership-registrations.xlsx');
  };

  const filteredRegistrations = registrations.filter(reg => 
    `${reg.firstName} ${reg.middleName || ''} ${reg.surname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.includes(searchTerm)
  );

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowRegistrationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaUserPlus /> New Registration
          </motion.button>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search registrations..."
            className="px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={exportToPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <FaDownload /> Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaDownload /> Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{`${reg.firstName} ${reg.middleName || ''} ${reg.surname}`.trim()}</td>
                    <td className="px-6 py-4">{reg.email}</td>
                    <td className="px-6 py-4">{reg.phone}</td>
                    <td className="px-6 py-4">{reg.experience}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reg.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reg.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setViewRegistration(reg)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditRegistration(reg)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Registration"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation({ id: reg._id, isOpen: true })}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Registration"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center px-6 py-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRegistrations.length)} of {filteredRegistrations.length} entries
            </div>
            
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </motion.button>

              {totalPages <= 7 ? (
                // Show all pages if total pages are 7 or less
                [...Array(totalPages)].map((_, index) => (
                  <motion.button
                    key={index + 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </motion.button>
                ))
              ) : (
                // Show limited pages with ellipsis for large numbers
                <>
                  {[1, 2, 3].map(num => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(num)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        currentPage === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </motion.button>
                  ))}
                  <span className="px-2 py-2">...</span>
                  {[totalPages - 2, totalPages - 1, totalPages].map(num => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(num)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        currentPage === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </motion.button>
                  ))}
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </motion.button>
            </div>
          </div>
        </>
      )}

      {/* View Registration Modal */}
      {viewRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Registration Details</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  viewRegistration.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  viewRegistration.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {viewRegistration.status || 'pending'}
                </span>
                <button
                  onClick={() => setViewRegistration(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p><span className="text-gray-500">Full Name:</span> {`${viewRegistration.firstName} ${viewRegistration.middleName || ''} ${viewRegistration.surname}`.trim()}</p>
                    <p><span className="text-gray-500">Email:</span> {viewRegistration.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {viewRegistration.phone}</p>
                    <p><span className="text-gray-500">Gender:</span> {viewRegistration.gender}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Location Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p><span className="text-gray-500">Region:</span> {viewRegistration.region}</p>
                    <p><span className="text-gray-500">District:</span> {viewRegistration.district}</p>
                    <p><span className="text-gray-500">Ward:</span> {viewRegistration.ward}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Leadership Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p><span className="text-gray-500">Experience Level:</span> {viewRegistration.experience}</p>
                    <div>
                      <span className="text-gray-500 block mb-2">Leadership Goals:</span>
                      <p className="text-gray-700">{viewRegistration.leadershipGoals}</p>
                    </div>
                  </div>
                </div>

                {viewRegistration.additionalComments && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Additional Comments</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{viewRegistration.additionalComments}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Registration Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <p><span className="text-gray-500">Registration Date:</span> {new Date(viewRegistration.registrationDate).toLocaleString()}</p>
                    <p><span className="text-gray-500">Registration ID:</span> {viewRegistration._id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    handleUpdateStatus(viewRegistration._id, 'accepted');
                    setViewRegistration(null);
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={viewRegistration.status === 'accepted'}
                >
                  <FaCheck className="mr-2" /> Accept Registration
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(viewRegistration._id, 'rejected');
                    setViewRegistration(null);
                  }}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={viewRegistration.status === 'rejected'}
                >
                  <FaTimes className="mr-2" /> Reject Registration
                </button>
              </div>
              <button
                onClick={() => setViewRegistration(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Registration Modal */}
      {editRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800">Edit Registration</h3>
              <button
                onClick={() => setEditRegistration(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleUpdate(editRegistration._id, editRegistration);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg">Personal Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={editRegistration.firstName}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            firstName: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                        <input
                          type="text"
                          value={editRegistration.middleName || ''}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            middleName: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Surname</label>
                        <input
                          type="text"
                          value={editRegistration.surname}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            surname: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editRegistration.email}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            email: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="text"
                          value={editRegistration.phone}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            phone: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={editRegistration.gender}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            gender: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg">Location Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <input
                          type="text"
                          value={editRegistration.region}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            region: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <input
                          type="text"
                          value={editRegistration.district}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            district: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ward</label>
                        <input
                          type="text"
                          value={editRegistration.ward}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            ward: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leadership Information */}
                <div className="col-span-2">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg">Leadership Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                        <input
                          type="text"
                          value={editRegistration.experience}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            experience: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Leadership Goals</label>
                        <textarea
                          value={editRegistration.leadershipGoals}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            leadershipGoals: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                        <textarea
                          value={editRegistration.additionalComments || ''}
                          onChange={(e) => setEditRegistration({
                            ...editRegistration,
                            additionalComments: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditRegistration(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <LeadershipCapacityForm 
          onClose={() => {
            setShowRegistrationForm(false);
            fetchRegistrations(); // Refresh data after new registration
          }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this registration? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageRegistrations;
