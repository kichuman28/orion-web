const OrionLogo = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="3" />
      <circle cx="30" cy="20" r="4" fill="currentColor" />
      <circle cx="20" cy="35" r="4" fill="currentColor" />
      <circle cx="40" cy="35" r="4" fill="currentColor" />
      <path 
        d="M30 20L20 35M30 20L40 35M20 35L40 35" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      <path 
        d="M30 8C18.9543 8 10 16.9543 10 28" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeDasharray="2 2" 
      />
    </svg>
  );
};

export default OrionLogo; 