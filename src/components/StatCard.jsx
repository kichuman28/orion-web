import React from 'react';

const StatCard = ({ title, value, icon, trend, trendValue, bgColor = 'bg-white' }) => {
  return (
    <div className={`${bgColor} rounded-xl shadow-md p-6 flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold text-orion-darkGray">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${bgColor === 'bg-white' ? 'bg-gray-100' : 'bg-white/20'}`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center mt-2">
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {trend === 'up' ? (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {trendValue}
          </span>
          <span className="text-xs text-gray-500 ml-2">vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard; 