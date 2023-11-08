import React from 'react';
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Auth/Login";
import RegisterStaff from "./Auth/RegisterStaff";
import Registration from "./Auth/Registration";
import Amenities from "./Dashboard/Amenities";
import Dashboard from './Dashboard/Dashboard';
import HomePage from "./Main/HomePage";
import Invoices from './Main/Invoices';
import Profile from './Main/Profile';


function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="amenities" element={<Amenities/>}/>
      <Route path="register" element={<Registration/>}/>
      <Route path="home" element={<HomePage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="dashboard" element={<Dashboard/>}/>
      <Route path="invoices" element={<Invoices/>}/>
      <Route path="staff" element={<RegisterStaff/>}/>
      <Route path="profile" element={<Profile/>}/>
    </Routes>
  );
}

export default App;
