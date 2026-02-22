import React from 'react';
import { assets } from '../assets/assets.js';
import MainIcon from '../assets/MainIcon.svg'
import { Link } from 'react-router-dom';
const Navbar = ({ setToken }) => {
  return (
    <div className='flex justify-between items-center py-2 px-[4%] bg-white-200'>
       <Link to="/" className="flex items-center gap-[5px] md:gap-[7.61px] flex-shrink-0">
              <img
                src={MainIcon}
                alt="The Sakhi Jewels"
                className="h-9 md:h-[49px] w-auto"
              />
              <span className="font-olivera text-lg md:text-[23.82px] leading-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFBD37] to-[#F7D14E]">
                THE SAKHI
                <br />
                JEWELS
              </span>
            </Link>
      
      <button
        onClick={() => {
          setToken('');
        }}
        className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer'
      >
        logout
      </button>
    </div>
  );
};

export default Navbar;
