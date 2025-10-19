import React from 'react';

const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.657.34-1.4.34-2.057 0l-5.25-2.917A1.5 1.5 0 012.25 11.5V8.5c0-.53.284-1.008.733-1.275l5.25-2.917a1.5 1.5 0 012.057 0l5.25 2.917c.449.267.733.745.733 1.275v3c0 .53-.284 1.008-.733 1.275l-5.25 2.917z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25v7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 6.375v11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 4.5v15" />
  </svg>
);

export default MegaphoneIcon;
