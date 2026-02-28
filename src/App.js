import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';


// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/common/PrivateRoute';


// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';


// Member Components
import MemberDashboard from './components/member/MemberDashboard';
import BrowseBooks from './components/books/BrowseBooks';
import MyBooks from './components/member/MyBooks';
import MyFines from './components/member/MyFines';
import MemberProfile from './components/member/MemberProfile';

//Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageMembers from './components/admin/ManageMembers';
import ManageBooks from './components/admin/ManageBooks';
import AllBorrowRecords from './components/admin/AllBorrowRecords';
import CreateAdmin from './components/admin/CreateAdmin';


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
                <Route path="/" element={<Navigate to="/login" />} />

                 {/* Member Routes */}
                <Route path="/member/dashboard" element={
                  <PrivateRoute requiredRole="MEMBER">
                    <MemberDashboard />
                  </PrivateRoute>
                } />
                <Route path="/member/books/search" element={
                  <PrivateRoute requiredRole="MEMBER">
                    <BrowseBooks />
                  </PrivateRoute>
                } />
                <Route path="/member/borrowed" element={
                  <PrivateRoute requiredRole="MEMBER">
                    <MyBooks />
                  </PrivateRoute>
                } />
                <Route path="/member/fines" element={
                  <PrivateRoute requiredRole="MEMBER">
                    <MyFines />
                  </PrivateRoute>
                } />
                <Route path="/member/profile" element={
                  <PrivateRoute requiredRole="MEMBER">
                    <MemberProfile />
                  </PrivateRoute>
                } />


                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <PrivateRoute requiredRole="ADMIN">
                    <AdminDashboard  />
                  </PrivateRoute>
                } />

                <Route path="/admin/members" element={
                  <PrivateRoute requiredRole="ADMIN">
                    <ManageMembers />
                  </PrivateRoute>
                } />

                <Route path="/admin/books" element={
                  <PrivateRoute requiredRole="ADMIN">
                    <ManageBooks />
                  </PrivateRoute>
                } />

                <Route path="/admin/borrows" element={
                  <PrivateRoute requiredRole="ADMIN">
                    <AllBorrowRecords />
                  </PrivateRoute>
                } />

                <Route path="/admin/create" element={
                  <PrivateRoute requiredRole="ADMIN">
                    <CreateAdmin />
                  </PrivateRoute>
                } />
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