import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface DentalHealthyFormProps {
  onClose: () => void;
}

const DentalHealthyForm: React.FC<DentalHealthyFormProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error' | ''>('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    dentalHistory: '',
    currentIssues: '',
    allergies: '',
    lastCheckup: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would send the data to your backend
      console.log('Dental form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Dental form submitted successfully!');
      setPopupType('success');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setPopupType('');
        onClose();
      }, 3000);
      
    } catch (error) {
      setMessage('Error submitting form. Please try again.');
      setPopupType('error');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setPopupType('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Popup */}
      {message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-500 ease-in-out ${
            popupType === "success" ? "bg-green-500" : 
            popupType === "error" ? "bg-red-500" : ''
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white p-10 rounded-lg w-11/12 max-w-xl max-h-[85vh] overflow-auto flex flex-col text-gray-600">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t('dentalHealthForm') || 'Dental Health Form'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('fullName') || 'Full Name'}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('age') || 'Age'}</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('gender') || 'Gender'}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            >
              <option value="">{t('selectGender') || 'Select Gender'}</option>
              <option value="Male">{t('male') || 'Male'}</option>
              <option value="Female">{t('female') || 'Female'}</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('contactNumber') || 'Contact Number'}</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('email') || 'Email'}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('address') || 'Address'}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('currentIssues') || 'Current Issues'}</label>
            <input
              type="text"
              name="currentIssues"
              value={formData.currentIssues}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('allergies') || 'Allergies'}</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('preferredDate') || 'Preferred Date'}</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('preferredTime') || 'Preferred Time'}</label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black bg-slate-200"
            >
              <option value="">{t('selectTime') || 'Select Time'}</option>
              <option value="morning">{t('morning') || 'Morning (8AM - 12PM)'}</option>
              <option value="afternoon">{t('afternoon') || 'Afternoon (12PM - 4PM)'}</option>
              <option value="evening">{t('evening') || 'Evening (4PM - 8PM)'}</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg w-full"
              disabled={isLoading}
            >
              {isLoading ? t('submitting') || 'Submitting...' : t('submit') || 'Submit'}
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg w-full"
        >
          {t('close') || 'Close'}
        </button>
      </div>
    </div>
  );
};

export default DentalHealthyForm;