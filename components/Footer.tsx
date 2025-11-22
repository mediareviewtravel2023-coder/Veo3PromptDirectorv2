
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-8 border-t border-[#1a1a40] mt-auto">
      <div className="container mx-auto text-center text-sm text-[#b9f2ff]/60">
        <a 
          href="https://www.phamphucanh.com/bio" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-[#b9f2ff] transition-colors duration-300"
        >
          Hãy kết nối với Phúc Anh MRT
        </a>
      </div>
    </footer>
  );
};
