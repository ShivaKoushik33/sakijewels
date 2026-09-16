import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { isAdminToken } from '../utils/token';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, seteMail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const response = await axios.post(backendUrl + '/api/auth/login', {
        email,
        password,
      });

      const token = response.data?.token;

      if (!token) {
        toast.error(response.data?.message || 'Login failed');
        return;
      }

      // A customer account can sign in here successfully but has no admin
      // rights, so every page would just 403. Say so instead.
      if (!isAdminToken(token)) {
        toast.error('This account does not have admin access');
        return;
      }

      setToken(token);
      toast.success('Login Successful!');
      navigate('/add');
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Could not sign in. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=' min-h-screen flex items-center justify-center w-full'>
      <div className='bg-white shadow-md  rounded-lg px-8 py-6 max-w-md'>
        <h1 className='text-2xl font-bold mb-4'>Admin Panel</h1>
        <form onSubmit={onSubmitHandler}>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-medium text-gray-700 mb-2'>
              Email Address
            </p>
            <input
              className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
              type='email'
              placeholder='Enter your email address'
              required
              value={email}
              onChange={(e) => {
                seteMail(e.target.value);
              }}
            />
          </div>
          <div className='mb-3 min-w-72'>
            <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
            <input
              className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none'
              type='password'
              placeholder='Enter your password please'
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>

          <button
            className='mt-2 w-full py-2 px-4 rounded-md text-white bg-gray-800 cursor-pointer disabled:opacity-60'
            type='submit'
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
