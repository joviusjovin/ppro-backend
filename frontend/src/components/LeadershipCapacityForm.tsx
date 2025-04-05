import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import config from '../config/config';
import locationData from '../context/data.json';

interface LeadershipCapacityFormProps {
  onClose: () => void;
}

const LeadershipCapacityForm: React.FC<LeadershipCapacityFormProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    surname: '',
    email: '',
    phone: '',
    gender: '',
    region: '',
    district: '',
    ward: '',
    experience: '',
    leadershipGoals: '',
    howDidYouHear: '',
    additionalComments: ''
  });
  
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionName = e.target.value;
    const selectedRegion = locationData.regions.find(r => r.name === regionName);
    setAvailableDistricts(selectedRegion ? selectedRegion.districts : []);
    setFormData(prev => ({ ...prev, region: regionName, district: '' }));
  };

  const isValidForm = () => {
    const requiredFields = ["firstName", "surname", "email", "phone", "gender", "region", "district", "ward", "experience", "leadershipGoals"];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        setPopupType("error"); 
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm()) return;
    
    setIsSubmitting(true);
    setMessage('');
    setPopupType('');

    try {
      const response = await fetch(`${config.apiUrl}/api/leadership-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(t('successData') || 'Registration submitted successfully!');
        setPopupType("success");
        setFormData({
          firstName: '',
          middleName: '',
          surname: '',
          email: '',
          phone: '',
          gender: '',
          region: '',
          district: '',
          ward: '',
          experience: '',
          leadershipGoals: '',
          howDidYouHear: '',
          additionalComments: ''
        });
        setTimeout(() => {
          onClose();
          setMessage('');
          setPopupType('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to submit registration');
      }
    } catch (error) {
      setMessage(t('registrationError') || 'Failed to submit registration. Please try again.');
      setPopupType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {message && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          popupType === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white p-10 rounded-lg w-11/12 max-w-xl max-h-[85vh] overflow-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t('leadershipCapacityFormTitle') || 'Leadership Capacity Building Registration'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('firstName') || 'First Name'} *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterFirstName') || 'Enter your first name'}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('middleName') || 'Middle Name'}</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterMiddleName') || 'Enter your middle name'}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('surName') || 'Surname'} *</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterSurname') || 'Enter your surname'}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('email') || 'Email'} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterEmail') || 'Enter your email'}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('phone') || 'Phone Number'} *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterPhone') || 'Enter your phone number'}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('gender') || 'Gender'} *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">{t('selectGender') || 'Select gender'}</option>
              <option value="Male">{t('male') || 'Male'}</option>
              <option value="Female">{t('female') || 'Female'}</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('region') || 'Region'} *</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleRegionChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">{t('selectRegion') || 'Select region'}</option>
              {locationData.regions.map(region => (
                <option key={region.name} value={region.name}>{region.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('district') || 'District'} *</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              disabled={!formData.region}
            >
              <option value="">{t('selectDistrict') || 'Select district'}</option>
              {availableDistricts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('ward') || 'Ward'} *</label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterWard') || 'Enter ward'}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">{t('experience') || 'Experience Level'} *</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">{t('selectExperience') || 'Select your experience level'}</option>
              <option value="beginner">{t('beginner') || 'Beginner (0-2 years)'}</option>
              <option value="intermediate">{t('intermediate') || 'Intermediate (3-5 years)'}</option>
              <option value="advanced">{t('advanced') || 'Advanced (6-10 years)'}</option>
              <option value="expert">{t('expert') || 'Expert (10+ years)'}</option>
            </select>
          </div>

          <div className="flex flex-col col-span-2">
            <label className="block text-sm font-medium mb-1">{t('leadershipGoals') || 'Leadership Goals'} *</label>
            <textarea
              name="leadershipGoals"
              value={formData.leadershipGoals}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterGoals') || 'Describe your leadership goals'}
            ></textarea>
          </div>

          <div className="flex flex-col col-span-2">
            <label className="block text-sm font-medium mb-1">{t('additionalComments') || 'Additional Comments'}</label>
            <textarea
              name="additionalComments"
              value={formData.additionalComments}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder={t('enterComments') || 'Any additional comments'}
            ></textarea>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('submitting') || 'Submitting...' : t('submit') || 'Submit'}
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          {t('close') || 'Close'}
        </button>
      </div>
    </div>
  );
};

export default LeadershipCapacityForm; 