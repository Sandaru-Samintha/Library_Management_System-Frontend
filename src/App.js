import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';


// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';


// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';




function App() {
  return (
    <Router>
      <AuthProvider> {/* Make sure this wraps your entire app */}
          <AlertProvider>
        <div className="app">
          <Toaster />
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes> 
              </main> 
              <Footer />
        </div>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;