import React from 'react';

const CreativeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5v10.5h-16.5V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v3.75H3.75V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75h4.5" />
    </svg>
);

export default CreativeIcon;
