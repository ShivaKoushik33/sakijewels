import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Add from './Pages/Add';
import List from './Pages/List';
import Orders from './Pages/Orders';
import { useEffect, useState } from 'react';
import Login from './Components/Login';
import { ToastContainer } from 'react-toastify';
import Edit from './Pages/Edit';
import OrderDetails from './Pages/OrderDetails';
import Dashboard from './Pages/Dashboard';
import Customers from './Pages/Customers';
import CustomerDetails from './Pages/CustomerDetails';
import { isAdminToken } from './utils/token';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

function App() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token') || '';
    return isAdminToken(stored) ? stored : '';
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const authorised = isAdminToken(token);

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {!authorised ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar />
            <div className='w-[70%] mx-auto ml-[max(5vw, 25px)] my-8  text-gray-600 text-base'>
              <Routes>
                <Route path='/' element={<Navigate to='/dashboard' replace />} />
                <Route path='/dashboard' element={<Dashboard token={token} />} />
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/customers' element={<Customers token={token} />} />
                <Route
                  path='/customers/:id'
                  element={<CustomerDetails token={token} />}
                />
                <Route path='/edit/:id' element={<Edit token={token} />} />
                <Route
                  path='/orders/single/:id'
                  element={<OrderDetails token={token} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
