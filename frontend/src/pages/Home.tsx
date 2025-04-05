import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Send,
  X,
  Target,
  Rocket,
  Handshake,
  Lightbulb,
  Droplets,
  Leaf,
  Gem,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from '../context/LanguageContext';
import BikeRiderForm from '../components/BikeRiderForm';
import DentalHealthyForm from '../components/DentalHealthyForm';
import LeadershipCapacityForm from '../components/LeadershipCapacityForm';
import config from "../config/config";
import { trackPageVisit, trackDuration } from '../utils/tracking';

/** @unused 
interface HeroImage {
  url: string;
  title: string;
}*/

/** @unused 
interface GalleryImage {
  url: string;
  title: string;
  category: string;
}*/

/** @unused 
interface TeamMember {
  name: string;
  role: string;
  image: string;
}*/

/** @unused 
interface Service {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}

/** @unused 
interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}*/

interface Project {
  title: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  status: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Home: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isDentalPopupOpen, setIsDentalPopupOpen] = useState<boolean>(false);
  const [isLeadershipPopupOpen, setIsLeadershipPopupOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Remove setTotalSlides from useState and just use a constant
  const totalSlides = 8;

  // Hero Images array
  const heroImages = [
    { url: 'https://i.postimg.cc/3NpVh2St/IMG-20250318-WA0030-2.jpg', title: "Image 1" },
    { url: 'https://i.postimg.cc/SQTJYCKn/IMG-20250324-WA0032-2.jpg', title: "Image 2" },
    { url: 'https://i.postimg.cc/sx6sKkyt/clean-water-donation.jpg', title: "Image 3" },
    { url: 'https://i.postimg.cc/7YRqzrKz/build-africa-history.jpg', title: "Image 4" },
    { url: 'https://i.postimg.cc/7ZTwMtRW/build-africa-charity-fighting-po.jpg', title: "Image 5" },
    { url: 'https://i.postimg.cc/j2pdk9pv/5412887532-4591d00b5c-b.jpg', title: "Image 6" },
    { url: 'https://i.postimg.cc/Sx1Cf3Vp/dentalslider-7.jpg', title: "Image 7" },
    { url: 'https://i.postimg.cc/Hsnpjk9H/48635959237-ebfb631000-b.jpg', title: "Image 8" },
    { url: 'https://i.postimg.cc/nLPxPqxL/girl-drinking.jpg', title: "Image 9" },
  ];

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    const galleryInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      clearInterval(heroInterval);
      clearInterval(galleryInterval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".animate-on-scroll");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight * 0.75;
        if (isVisible) {
          el.classList.add("animate-active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        console.log('Starting page visit tracking');
        await trackPageVisit(window.location.pathname);
        
        // Set up duration tracking on unmount
        return () => {
          console.log('Component unmounting, tracking duration');
          trackDuration(window.location.pathname);
        };
      } catch (error) {
        console.error('Error in tracking:', error);
      }
    };

    trackVisit();
  }, []); // Run once when component mounts

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? totalSlides - 1 : prevSlide - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === totalSlides - 1 ? 0 : prevSlide + 1));
  };

  const goToSlide = (slide: number) => {
    setCurrentSlide(slide);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name === 'name' ? 'name' : 
                     name === 'email' ? 'email' : 
                     name;
    
    setFormData(prevState => ({
      ...prevState,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Sending message:', formData);
      const response = await fetch(`${config.apiUrl}${config.publicEndpoints.contact}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: t('messageSentSuccess') || 'Message sent successfully!'
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        type: 'error',
        message: t('messageSendError') || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LanguageSwitcher />
      
      {/* Hero Section */}
      <div
        id="hero"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-purple-900/60" />
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-fade-in animate-on-scroll">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-delay">
            {t('heroSubtitle')}
          </p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2 dark:bg-[#194054] dark:backdrop-blur-md dark:shadow-lg"
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowRegistration(true)}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center space-x-2 dark:bg-[#194054] dark:backdrop-blur-md dark:shadow-lg"
            >
              <span>{t('ViewRegistration')}</span>
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-24 bg-gray-100 hover:scale-105 backdrop-blur-md shadow-lg dark:bg-[#001c26] dark:hover:scale-105 transition-transform duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-110 dark:text-white">
              {t('aboutTitle')}
            </h2>
            <p className="text-xl text-gray-600 animate-on-scroll dark:text-white">
              {t('aboutDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 m-0 animate-on-scroll">
            {[
              {
                icon: Target,
                title: t('ourMission'),
                description: t('missionStatement'),
                features: [],
              },
              {
                icon: Rocket,
                title: t('ourVision'),
                description: t('visionStatement'),
                features: [],
              },
              {
                icon: Gem,
                title: t('ourValue'),
                description: t('valueStatement'),
                features: [],
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-2 transition-transform duration-300 animate-on-scroll dark:bg-[#194054] dark:backdrop-blur-md dark:shadow-lg"
              >
                <service.icon className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">{t(service.title)}</h3>
                <p className="text-gray-600 mb-6 dark:text-white">{t(service.description)}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-600 dark:text-white">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-center mb-20 p-4">
            {[
              { icon: Handshake, label: "", value: t('value') },
            ].map((stat, index) => (
              <div key={index} className="animate-on-scroll">
                <stat.icon className="w-12 h-12 mx-auto mb-8 text-blue-600 dark:text-white" />
                <div className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-110 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-white">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              {
                name: t('government'),
                role: "",
                image: 'https://i.postimg.cc/RVHcm8Qv/tz-flag.jpg',
              },
              {
                name: t('donors'),
                role: "",
                image: 'https://i.postimg.cc/8cFLjX2B/donors.jpg',
              },
              {
                name: t('ngos'),
                role: "",
                image: 'https://i.postimg.cc/0jLDmdxg/NGO-S.jpg',
              },
              {
                name: t('individual'),
                role: "",
                image: 'https://i.postimg.cc/d1N8QcxV/individual.jpg',
              },
            ].map((member, index) => (
              <div key={index} className="animate-on-scroll">
                <div className="relative h-60 mb-6 rounded-xl overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-blue-800 mb-2 dark:text-white">{member.name}</h3>
                <p className="text-gray-600 dark:text-white">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-24 bg-gray-50 hover:scale-105 backdrop-blur-md shadow-lg dark:bg-[#001c24] dark:hover:scale-105 transition-transform duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-110 dark:text-white">
              {t('servicesTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
               {
                icon: Lightbulb,
                title: t('consultancy'),
                description: t('consultancyDiscr'),
                features: []
              },
              {
                icon: Droplets,
                title: t('waterSanitation'),
                description: t('waterSanitationDiscr'),
                features: []
              },
              {
                icon: Leaf,
                title: t('digitalMarketing'),
                description: t('digitalMarketingDiscr'),
                features: []
              },
              {
                icon: Users,
                title: t('designDevelopment'),
                description: t('designDevelopmentDiscr'),
                features: []
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 animate-on-scroll dark:bg-[#194054]"
              >
                <service.icon className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-white">{t(service.title)}</h3>
                <p className="text-gray-600 mb-6 dark:text-white">{t(service.description)}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-600 dark:text-white">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects" className="py-24 bg-white hover:scale-105 ease-in-out backdrop-blur-md shadow-lg dark:bg-[#001c26] dark:backdrop-blur-md dark:shadow-lg dark:hover:scale-105 transition-transform duration-300 ease-in-out animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-105 dark:text-white">
              {t('ourProjects')}
            </h2>
            <p className="text-xl text-gray-600 animate-on-scroll dark:text-white">
              {t('ourProjectDiscr')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
         {
          title: '',
          category: t('bodabodaSmart'),
          description: t('bodabodaSmartDiscr'),
          image: 'https://i.postimg.cc/V6kqck4h/bodabodas-og-image.jpg',
          technologies: [],
          status: 'Proposed'
        },
        {
          title: '',
          category: t('charityServices'),
          description: t('charityServiceDiscr'),
          image: 'https://i.postimg.cc/Sx1Cf3Vp/dentalslider-7.jpg',
          technologies: [],
          status: 'Proposed'
        },
        {
          title: '',
          category: t('dropshipping'),
          description: t('dropshippingDiscr'),
          image: 'https://i.postimg.cc/nLPxPqxL/girl-drinking.jpg',
          technologies: [],
          status: 'Proposed'
        },
        {
          title: '',
          category: t('individualororganisationDonation'),
          description: t('individualororganisationDonationDiscr'),
          image: 'https://i.postimg.cc/j2pdk9pv/5412887532-4591d00b5c-b.jpg',
          technologies: [],
          status: 'Proposed'
        },
        {
          title: '',
          category: t('environmentalConservation'),
          description: t('environmentalConservationDiscr'),
          image: 'https://i.postimg.cc/BnZ31PcG/tree.jpg',
          technologies: [],
          status: 'Proposed'
        },
        {
          title: '',
          category: t('leadershipCapacity'),
          description: t('leadershipCapacityDiscr'),
          image: 'https://i.postimg.cc/3NpVh2St/IMG-20250318-WA0030-2.jpg',
          technologies: [],
          status: 'Proposed'
        },
            ].map((project, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg animate-on-scroll hover:scale-105 duration-300 ease-in-out dark:bg-[#194054]"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                      {project.category}
                    </span>
                    <span className="ml-4 px-3 py-1 bg-yellow-400 rounded-full text-sm">
                      {project.status}
                      </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>
                  {project.category === t('bodabodaSmart') && (
                    <button
                      onClick={() => {
                        setIsPopupOpen(true);
                        setSelectedProject(project);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      {t('formRegister') || 'Register'}
                    </button>
                  )}
                  {project.category === t('charityServices') && (
                    <button
                      onClick={() => {
                        setIsDentalPopupOpen(true);
                        setSelectedProject(project);
                      }}
                      className="mt-20 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      {t('dentalHealthForm') || 'Dental Health Form'}
                    </button>
                  )}
                  {project.category === t('leadershipCapacity') && (
                    <button
                      onClick={() => {
                        setIsLeadershipPopupOpen(true);
                        setSelectedProject(project);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      {t('formRegister') || 'Leadership Capacity Form'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    
      {/* Popup Forms */}
      {isPopupOpen && selectedProject && (
        <BikeRiderForm onClose={() => setIsPopupOpen(false)} />
      )}
      {isDentalPopupOpen && (
        <DentalHealthyForm onClose={() => setIsDentalPopupOpen(false)} />
      )}
      {isLeadershipPopupOpen && (
        <LeadershipCapacityForm onClose={() => setIsLeadershipPopupOpen(false)} />
      )}

      {/* Gallery Section */}
      <div id="gallery" className="py-24 bg-gray-50 hover:scale-105 backdrop-blur-md shadow-lg dark:bg-[#001c24] dark:backdrop-blur-md dark:shadow-lg dark:hover:scale-105 transition-transform duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-110 ease-in-out dark:text-white">{t('galleryi')}</h2>
            <p className="text-xl text-gray-600 animate-on-scroll dark:text-white">
              {t('galleryDescription')}
            </p>
          </div>

          {/* Slideshow Container */}
          <div className="relative w-full h-[500px] overflow-hidden rounded-xl shadow-2xl mb-12 animate-on-scroll">
            {/* Slides */}
            <div 
              className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {[
                'https://i.postimg.cc/67GVHBxh/Bridge-in-Dar-es-Salaam.jpg',
                'https://i.postimg.cc/5YSCG078/shutterstock-RF-363076172.avif',
                'https://i.postimg.cc/tn9hCPZr/DSC4992-scaled.jpg',
                'https://i.postimg.cc/Ty853mBr/IMG-20230222-224548-971.jpg',
                'https://i.postimg.cc/jCT6XVgz/makutupora-railway-line-4.jpg',
                'https://i.postimg.cc/dLt8b2K3/sgr.png',
                'https://i.postimg.cc/9zBdgxKs/shutterstock-1238975587-jpg.webp',
                'https://i.postimg.cc/nXXqznrt/tanz.jpg'
              ].map((image, index) => (
                <div 
                  key={index}
                  className="w-full h-full flex-shrink-0 relative"
                >
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {['Dar es Salaam Bridge', 'Mountain Kilimanjaro', 'Public Health', 'Plantation', 
                        'SGR Railway', 'SGR Train', 'National Park', 'Crops Market'][index]}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
              onClick={nextSlide}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'} transition`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                url: 'https://i.postimg.cc/67GVHBxh/Bridge-in-Dar-es-Salaam.jpg',
                title: 'Dar es Salaam Bridge',
                category: 'Infrastructure'
              },
              {
                url: 'https://i.postimg.cc/5YSCG078/shutterstock-RF-363076172.avif',
                title: 'Mountain Kilimanjaro',
                category: 'Nature'
              },
              {
                url: 'https://i.postimg.cc/tn9hCPZr/DSC4992-scaled.jpg',
                title: 'Public Healthy',
                category: 'Healthy'
              },
              {
                url: 'https://i.postimg.cc/Ty853mBr/IMG-20230222-224548-971.jpg',
                title: 'Plantation',
                category: 'Agriculture'
              },
              {
                url: 'https://i.postimg.cc/jCT6XVgz/makutupora-railway-line-4.jpg',
                title: 'SGR-Railway Line',
                category: 'Transport'
              },
              {
                url: 'https://i.postimg.cc/dLt8b2K3/sgr.png',
                title: 'SGR-Train',
                category: 'Transport'
              },
              {
                url: 'https://i.postimg.cc/9zBdgxKs/shutterstock-1238975587-jpg.webp',
                title: 'Tanzania national Park',
                category: 'Tourism'
              },
              {
                url: 'https://i.postimg.cc/nXXqznrt/tanz.jpg',
                title: 'Crops Market',
                category: 'Agriculture'
              }
            ].map((image, index) => (
              <div
                key={index}
                className="relative h-40 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImage(image.url)}
              >
                  <img
                    src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 bg-white hover:scale-105 ease-in-out backdrop-blur-md shadow-lg dark:bg-[#001c26] dark:backdrop-blur-md dark:shadow-lg dark:hover:scale-105 transition-transform duration-300 ease-in-out animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-110 dark:text-white">
              {t('contactTitle')}
            </h2>
            <p className="text-xl text-gray-600 animate-on-scroll dark:text-white">
              {t('contactDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-gray-800">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">{t('contactFormTitle')}</h2>
              
              {submitStatus.type && (
                <div className={`mb-4 p-4 rounded ${
                  submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                    {t('subject')}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('subjectPlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                    {t('message')}
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('messagePlaceholder')}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span>{t('sending')}</span>
                  ) : (
                    <>
                      <span>{t('sendMessage')}</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-12">
              <div className="animate-on-scroll">
                <h2 className="text-4xl font-bold text-gray-900 mb-4 transition transform duration-300 ease-in-out hover:scale-110 dark:text-white">{t('contactInformation')}</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('email')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">ppro@pprotz.org </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('phone')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">(+255)764 044 001</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('address')}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Office no 1. Masjid haqq, Buguruni,  Dar es Salaam <br />
                        P.O Box 911<br />
                        Tel: +255764044001
                      </p>
                      
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="animate-on-scroll hover:scale-105 transition ease-in-out">
              <div className="h-64 bg-gray-200 rounded-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d416.3990006102114!2d39.24795119119695!3d-6.833240933732734!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2stz!4v1738737694725!5m2!1sen!2stz" 
                  width="100%" 
                  height="100%" 
                  style={{ border: '0', borderRadius: '0.5rem' }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Selected"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}

      {/* Registration Certificate Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col dark:bg-gray-800">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-xl bg-blue-600 text-white font-bold dark:text-white dark:bg-gray-800">Certificate of Registration</h3>
              <button
                onClick={() => setShowRegistration(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <img 
                src="https://i.postimg.cc/2yMCgHzH/CERTIFICATE-OF-REGISTRATION-page-0001.jpg" 
                alt="Certificate of Registration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;