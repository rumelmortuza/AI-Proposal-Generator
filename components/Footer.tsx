
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 border-t border-slate-200">
      <div className="container mx-auto px-4 md:px-8 py-4 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI Proposal Generator. Powered by Gemini.</p>
      </div>
    </footer>
  );
};

export default Footer;
