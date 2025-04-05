import React from 'react';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'react-hot-toast';
import AdminApp from './admin/AdminApp';

// Public Layout component for Home page
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class">
        <LanguageProvider>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <Toaster position="top-right" />
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminApp />} />
              
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicLayout>
                    <Home />
                  </PublicLayout>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;