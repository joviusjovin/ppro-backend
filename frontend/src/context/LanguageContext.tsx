import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sw';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translations {
  home: string;
  about: string;
  services: string;
  projects: string;
  gallery: string;
  contact: string;
  getStarted: string;
  aboutUs: string;
  quickLinks: string;
  contactUs: string;
  followUs: string;
  invalidPhone: string;
  // Add other keys as necessary
}

const translations = {
  en: {
    // Navigation & Common
    home: 'Home',
    about: 'About',
    services: 'Objectives',
    projects: 'Projects',
    gallery: 'Gallery',
    contact: 'Contact',
    getStarted: 'Get Started',
    aboutUs: 'About Us',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    followUs: 'Follow Us',
    stayConnected: 'Stay connected with us on social media',
    allRightsReserved: 'All rights reserved',
    readMore: 'Read More',
    viewAll: 'View All',
    loadMore: 'Load More',
    subscribe: 'Subscribe',
    search: 'Search',
    
    // Organization Info
    partnershipForPovertyReductionOrganisation: 'Partnership For Poverty Reduction Organisation',
    masjidHaqqBuguruniDarEsSalaam: 'Masjid haqq, Buguruni, Dar es Salaam',
    organizationMotto: 'Together We Can Make a Difference',
    donateNow: 'Donate Now',
    volunteer: 'Become a Volunteer',
    joinUs: 'Join Us',
    
    // Hero Section
    heroTitle: 'Partnership for Poverty Reduction Organisation',
    heroSubtitle: '"Empowering Communities, Eradicating Poverty, Ensuring Equality."',
    exploreProjects: 'Explore Our Projects',
    learnMore: 'Learn More',
    
    // About Section
    aboutTitle: 'About Us',
    aboutDescription: 'We are dedicated to making a difference in communities across Tanzania.',
    ourMission: 'Our Mission',
    ourVision: 'Our Vision',
    ourValues: 'Our Values',
    missionStatement: 'Support the community welfares by developing the economy of women and youth.',
    visionStatement: 'Youth and women who are empowered and reach their fullest potential.',
    value: 'Partnership',
    government: 'Government',
    donors: 'Donors',
    ngos: 'Non-Governmental Organisations',
    individual: 'Individual',

    // Services Section
    servicesTitle: 'Our Objectives',
    servicesDescription: 'Comprehensive solutions for your needs',
    educationSupport: 'Education Support',
    healthcareAccess: 'Healthcare Access',
    economicEmpowerment: 'Economic Empowerment',
    communityDevelopment: 'Community Development',
    skillsTraining: 'Skills Training',
    waterSanitation: 'Water & Sanitation',
    websiteDevelopment: 'Website Development',
    charityServices: 'Dental health and hygiene', 
    digitalMarketing: 'Rising awareness on environmental protection and preservation',
    projectManagement: 'Project Management',
    designDevelopment: 'Promote cultural growth and exchange',
    consultancy: 'Promote youth and women economic stability',
    websiteDevelopmentDiscr: 'Website development involves creating and maintaining websites, including web design, front-end and back-end development, SEO, and maintenance. It is a mix of creative and technical skills. The goal is to build engaging user experiences.',
    charityServicesDiscr: 'Ensures communities thrive through clean water and proper sanitation. which promotes public health, dignity and sustainable development.',
    digitalMarketingDiscr: 'Educates communities about sustainable practices to safeguard ecosystems. Promoting preservation efforts ensures natural resource conservation for future generations.',
    projectManagementDiscr: 'Project management involves planning, organizing, and overseeing tasks to achieve specific goals within a set timeframe and budget. It includes defining project objectives, coordinating resources, managing teams, and monitoring progress. The aim is to ensure projects are completed efficiently and successfully.',
    designDevelopmentDiscr: 'Nurtures traditions, arts, and heritage to strengthen community identity. Encouraging cultural exchange fosters mutual understanding and global connections through shared experiences.',
    consultancyDiscr: 'Empowering young people and women with skills, jobs, and entrepreneurship opportunities to achieve financial independence, while ensuring equal access to resources, education, and fair employment to strengthen their economic security and societal impact.',
    
    // Projects Section
    ourProjects: 'Our Projects',
    bodabodaSmart: 'Bodaboda Smart',
    charityService: 'Charity Services',  
    dropshipping:'Access to clean water',
    individualororganisationDonation:'Access to clean water II',
    bodabodaSmartDiscr:'Bodaboda Smart System features a user-friendly online smart application that connects passengers with registered motorbike riders, similar to the Uber app. Users can request rides, track their drivers location, and make cashless payments through the app, ensuring convenience, safety, and efficiency.',
    charityServiceDiscr:'Providing dental treatment and distributing toothbrushes to six government schools in Lushoto district, Bumbuli Council',
    dropshippingDiscr:'Purchase water equipment, for access to clean water at the secondary school and the Kwenguruwe dispensary in Lushoto district, Bumbuli council, Tanga region.',
    individualororganisationDonationDiscr:'Installation of rainwater harvesting tanks at three schools and three dispensaries in need in Bumbuli council, Lushoto district, Tanga region',
    seeMore: 'See More',
    formRegister:'Register',
    environmentalConservation:'Environmental Conservation',
    environmentalConservationDiscr:'Environmental Conservation is a vital initiative focused on protecting our planet by reducing pollution, preserving natural resources, and encouraging sustainable practices. Through collective action and awareness, this program helps safeguard ecosystems for future generations.',
    leadershipCapacity:'Leadership Capacity Building',
    leadershipCapacityDiscr:'Leadership Capacity Building empowers leaders with the skills and vision to drive growth, inspire teams, and navigate change effectively. Strengthen your organization by cultivating resilient, forward-thinking leaders ready to tackle tomorrow’s challenges.',
    
    //bikerider
    bodaInfo:'Bodaboda Rider Informations',
    firstName:'First Name',
    middleName:'Middle Name',
    surName:'Surname',
    gender:'Gender',
    selectGender:'Select Gender',
    male:'Male',
    female:'Female',
    region:'Region',
    selectRegion:'Select Region',
    district:'District',
    selectDistrict:'Select District',
    ward:'Ward',
    village:'Village',
    bikeStation:'Bike Station',
    bikeNumber:'Bike Number',
    license:'License',
    submit:'Submit',
    closec:'Close',

    //leadership capacity form
    leadershipCapacityFormTitle:'Leadership Capacity Building Training Registration',

    //popup msg
    failData:'Failed to save your data',
    dataSuccess:'Data Sent Successfully!',
    licenseExists:'License Already Exists',
    
    // Gallery Section
    galleryi:'Gallery',
    galleryDescription:'A visual journey through our work and culture',

    
    // Impact Section
    impactTitle: 'Our Impact',
    ourProjectDiscr:'Showcasing our best work and innovative solutions',
    impactDescription: 'Making real change in communities',
    peopleHelped: 'People Helped',
    communitiesServed: 'Communities Served',
    projectsCompleted: 'Projects Completed',
    volunteersEngaged: 'Volunteers Engaged',
    
    // News & Updates
    newsTitle: 'News & Updates',
    newsDescription: 'Stay informed about our latest activities',
    latestNews: 'Latest News',
    pressReleases: 'Press Releases',
    newsletters: 'Newsletters',
    events: 'Events',
    
    // Contact Section
    contactTitle: 'Contact Us',
    contactDescription: 'Get in touch with us',
    name: 'Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    subject: 'Subject',
    message: 'Message',
    send: 'Send',
    address: 'Address',
    phone: 'Phone',
    emailUs: 'Email Us',
    officeHours: 'Office Hours',
    sendMessage:'Send Message',
    contactFormTitle:'Contact Us',
    
    // Form Placeholders
    namePlaceholder: 'Enter your name',
    emailPlaceholder: 'Enter your email',
    subjectPlaceholder: 'Enter subject',
    messagePlaceholder: 'Enter your message',
    phonePlaceholder: 'Enter your phone number',
    
    // Footer
  
    testimonials: 'Testimonials',
    impactReport: 'Impact Report',
    annualReport: 'Annual Report',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    contactInformation: 'Contact Information',
    
    // Success Messages
    messageSent: 'Message sent successfully',
    subscriptionSuccess: 'Successfully subscribed to newsletter',
    donationSuccess: 'Thank you for your donation',
    
    // Error Messages
    errorMessage: 'An error occurred. Please try again.',
    requiredField: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number'
  },
  sw: {
    // Navigation & Common
    home: 'Nyumbani',
    about: 'Kuhusu',
    services: 'Malengo',
    projects: 'Miradi',
    gallery: 'Picha',
    contact: 'Wasiliana',
    getStarted: 'Anza Sasa',
    aboutUs: 'Kuhusu Sisi',
    quickLinks: 'Viungo vya Haraka',
    contactUs: 'Wasiliana Nasi',
    followUs: 'Tufuate',
    stayConnected: 'Endelea kuwa nasi kwenye mitandao ya kijamii',
    allRightsReserved: 'Haki zote zimehifadhiwa',
    readMore: 'Soma Zaidi',
    viewAll: 'Tazama Yote',
    loadMore: 'Pakua Zaidi',
    subscribe: 'Jiandikishe',
    search: 'Tafuta',
    
    // Organization Info
    partnershipForPovertyReductionOrganisation: 'Shirika la Ushirikiano wa Kupunguza Umaskini',
    masjidHaqqBuguruniDarEsSalaam: 'Msikiti wa Haqq, Buguruni, Dar es Salaam',
    organizationMotto: 'Pamoja Tunaweza Kuleta Mabadiliko',
    donateNow: 'Changia Sasa',
    volunteer: 'Kuwa Mhudumu wa Kujitolea',
    joinUs: 'Jiunge Nasi',
    
    // Hero Section
    heroTitle: 'Ushirikiano wa Kupunguza Umasikini',
    heroSubtitle: '"Kuwezesha Jamii, Kuondoa Umaskini, Kuhakikisha Usawa."',
    exploreProjects: 'Chunguza Miradi Yetu',
    learnMore: 'Jifunze Zaidi',
    
    // About Section
    aboutTitle: 'Kuhusu Sisi',
    aboutDescription: 'Tumejitolea kuleta mabadiliko katika jamii za Tanzania.',
    ourMission: 'Dhamira Yetu',
    ourVision: 'Maono Yetu',
    ourValues: 'Maadili Yetu',
    missionStatement: 'Kuendeleza ustawi wa jamii kwa kukuza uchumi wa wanawake na vijana.',
    visionStatement: 'Vijana na wanawake waliowezeshwa na kufikia upeo wa uwezo wao.',
    value: 'Ushirika',
    government: "Serikali",
    donors: 'Watoa misaada',
    ngos: 'Mashirika yasio ya kiserikari',
    individual: 'Mtu binafsi',

    // Services Section
    servicesTitle: 'Malengo',
    servicesDescription: 'Suluhisho kamili kwa mahitaji yako',
    educationSupport: 'Msaada wa Elimu',
    healthcareAccess: 'Upatikanaji wa Huduma za Afya',
    economicEmpowerment: 'Uwezeshaji Kiuchumi',
    communityDevelopment: 'Maendeleo ya Jamii',
    skillsTraining: 'Mafunzo ya Ujuzi',
    waterSanitation: 'Maji na Usafi',
    websiteDevelopment: 'Uundaji wa Tovuti',
    charityServices: 'Afya ya meno na usafi',
    digitalMarketing: 'Kukuza uelewa juu ya ulinzi na uhifadhi wa mazingira',
    projectManagement: 'Usimamizi wa Mradi',
    designDevelopment: 'Kuendeleza na kuhamasisha utamaduni',
    consultancy: 'Kukuza uchumi wa vijana na wanawake',
    websiteDevelopmentDiscr: 'Uundaji wa tovuti unahusisha kuunda na kudumisha tovuti, ikiwa ni pamoja na muundo wa wavuti, maendeleo ya mbele na nyuma, SEO, na matengenezo. Ni mchanganyiko wa ujuzi wa ubunifu na kiufundi. Lengo ni kujenga uzoefu unaovutia wa watumiaji.',
    charityServicesDiscr: 'Inahakikisha jamii inastawi kupitia maji safi na usafi wa mazingira unaostahili. ambayo inakuza afya ya umma, utu na maendeleo endelevu.',
    digitalMarketingDiscr: 'Kuelimisha jamii kuhusu mazoea endelevu ya kulinda mifumo ya ikolojia. Kukuza juhudi za uhifadhi kunahakikisha uhifadhi wa maliasili kwa vizazi vijavyo.',
    projectManagementDiscr: 'Usimamizi wa mradi unahusisha kupanga, kupanga, na kusimamia kazi ili kufikia malengo mahususi ndani ya muda uliowekwa na bajeti. Inajumuisha kufafanua malengo ya mradi, kuratibu rasilimali, kusimamia timu, na ufuatiliaji wa maendeleo. Lengo ni kuhakikisha miradi inakamilika kwa ufanisi na kwa ufanisi.',
    designDevelopmentDiscr: 'Hukuza mila, sanaa, na turathi ili kuimarisha utambulisho wa jamii. Kuhimiza ubadilishanaji wa kitamaduni kunakuza maelewano na miunganisho ya kimataifa kupitia uzoefu wa pamoja.',
    consultancyDiscr: 'Kuwawezesha vijana na wanawake kwa ujuzi, kazi, na fursa za ujasiriamali ili kufikia uhuru wa kifedha, huku kuhakikisha upatikanaji sawa wa rasilimali, elimu, na ajira ya haki ili kuimarisha usalama wao wa kiuchumi na athari za kijamii.',
    

    // Projects Section
    ourProjects: 'Miradi Yetu',
    ourProjectDiscr:'Kuonesha kazi zetu bora na masuluhisho ya kiubunifu',
    bodabodaSmart: 'Bodaboda Smart',
    charityService: 'Huduma za Hisani',
    dropshipping:'Upatikanaji wa maji safi',
    individualororganisationDonation:'Upatikanaji wa maji safi II',
    bodabodaSmartDiscr:'Mfumo huu unaangazia programu mahiri mtandaoni huunganisha abiria na waendesha pikipiki waliosajiliwa. Watumiaji wanaweza kuomba usafiri, kufuatilia eneo la madereva wao, na kufanya malipo bila pesa taslimu kupitia programu, kuhakikisha urahisi, usalama na ufanisi.',
    charityServiceDiscr:'Kufanya matibabu ya meno na kugawa miswaki kwenye shule sita za serikali katika wilaya ya Lushoto Halmashauri ya Bumbuli.',
    dropshippingDiscr:'Kununua vifaa vya maji ,kwa ajili ya upatikanaji wa maji safi kwenye shule ya sekondari na zahanati ya kwenguruwe wilayani Lushoto halmashauri ya Bumbuli mkoani Tanga.',
    individualororganisationDonationDiscr:'Uwekaji wa matenki kwa ajili kuvuna maji ya mvua kwenye shule tatu  na zahanati tatu zenye uhitaji kwenye halmashauri ya Bumbuli wilayani Lushoto mkoani Tanga .',
    seeMore: 'Ona zaidi',
    formRegister: 'Jisajili',
    environmentalConservation:'Uhifadhi wa Mazingira',
    environmentalConservationDiscr: 'Uhifadhi wa Mazingira ni mpango muhimu unaolenga kulinda sayari yetu kwa kupunguza uchafuzi, kuhifadhi rasilimali asili, na kuhimiza mazoea endelevu. Kupitia hatua za pamoja na uhamasishaji, mpango huu husaidia kulinda mifumo ya ikolojia kwa vizazi vijavyo.',
    leadershipCapacity:'Kujenga Uwezo wa Uongozi',
    leadershipCapacityDiscr:'Ujenzi wa uwezo wa uongozi huwapa viongozi ujuzi na maono ya kuendesha ukuaji, kuhamasisha timu, na kukabiliana na mabadiliko kwa ufanisi. Imarisha shirika lako kwa kukuza viongozi wenye ustahimilivu na wenye mtazamo wa mbele, walio tayari kukabiliana na changamoto za kesho.',

    //bikerriderform
    bodaInfo:'Taarifa za Dereva Bodaboda',
    firstName:'Jina la Kwanza',
    middleName:'Jina la Kati (sio Lazima)',
    surName:'Ubini',
    gender:'Jinsi',
    selectGender:'Changua jinsi',
    male:'Mwanaume',
    female:'Mwanamke',
    region:'Mkoa',
    selectRegion:'Chagua Mkoa',
    district:'Wilaya',
    selectDistrict:'Chagua wilaya',
    ward:'Kata',
    village:'Kijiji',
    bikeStation:'Kituo Cha bodaboda',
    bikeNumber:'Namba ya bodaboda',
    license:'Leseni',
    submit:'Tuma',
    close:'Funga',

  //leadership capacity form
  leadershipCapacityFormTitle: 'Usajili wa Mafunzo ya Kuimarisha Uwezo wa Uongozi',

  

  //popup msg
  failData:'Taarifa hazijatumwa',
  dataSuccess:'Taarifa Zimetumwa Kikamilifu!',
  licenseExists:'Leseni Imetumika',

    //gallery
    galleryi:'Picha',
    galleryDescription:'Picha za kazi zetu',
    // Impact Section
    impactTitle: 'Athari Zetu',
    impactDescription: 'Kuleta mabadiliko halisi katika jamii',
    peopleHelped: 'Watu Waliosaidika',
    communitiesServed: 'Jamii Zilizofikiwa',
    projectsCompleted: 'Miradi Iliyokamilika',
    volunteersEngaged: 'Wahudumu wa Kujitolea',
    
    // News & Updates
    newsTitle: 'Habari na Mabadiliko',
    newsDescription: 'Pata taarifa kuhusu shughuli zetu za hivi karibuni',
    latestNews: 'Habari za Hivi Karibuni',
    pressReleases: 'Taarifa kwa Vyombo vya Habari',
    newsletters: 'Jarida',
    events: 'Matukio',
    
    // Contact Section
    contactTitle: 'Wasiliana Nasi',
    contactDescription: 'Mawasiliano',
    name: 'Jina',
    email: 'Barua Pepe',
    phoneNumber: 'Namba ya Simu',
    subject: 'Somo',
    message: 'Ujumbe',
    send: 'Tuma',
    address: 'Anwani',
    phone: 'Simu',
    emailUs: 'Tuma Barua Pepe',
    officeHours: 'Saa za Ofisi',
    sendMessage:'Tuma Ujumbe',
    contactFormTitle:'Wasiliana Nasi',
    
    // Form Placeholders
    namePlaceholder: 'Ingiza jina lako',
    emailPlaceholder: 'Ingiza barua pepe yako',
    subjectPlaceholder: 'Ingiza somo',
    messagePlaceholder: 'Ingiza ujumbe wako',
    phonePlaceholder: 'Ingiza namba yako ya simu',
    
    // Footer
   
    testimonials: 'Shuhuda',
    impactReport: 'Ripoti ya Athari',
    annualReport: 'Ripoti ya Mwaka',
    privacyPolicy: 'Sera ya Faragha',
    termsConditions: 'Vigezo na Masharti',
    contactInformation: 'Wasiliana Nasi',

    //contacts
    
    
    // Success Messages
    messageSent: 'Ujumbe umetumwa kwa mafanikio',
    subscriptionSuccess: 'Umefanikiwa kujisajili kwenye jarida',
    donationSuccess: 'Asante kwa mchango wako',
    
    // Error Messages
    errorMessage: 'Hitilafu imetokea. Tafadhali jaribu tena.',
    requiredField: 'Sehemu hii inahitajika',
    invalidEmail: 'Tafadhali ingiza anwani halali ya barua pepe',
    invalidPhone: 'Tafadhali ingiza namba halali ya simu'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof Translations] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
