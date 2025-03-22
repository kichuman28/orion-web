import React from 'react';
import { Link } from 'react-router-dom';

const LessonCard = ({ lesson }) => {
  const { id, title, description, progress, image, category, duration } = lesson;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img 
          src={image || 'https://via.placeholder.com/400x200?text=Lesson'} 
          alt={title} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full shadow">
          {duration}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <span className="text-xs font-medium text-white/90 px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-orion-darkGray mb-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>
        
        <div className="mt-2 mb-3">
          <div className="flex justify-between items-center mb-1 text-xs text-gray-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <Link 
          to={`/learning/lesson/${id}`}
          className="mt-2 flex justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orion-darkGray hover:bg-orion-mediumGray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orion-darkGray transition-colors"
          tabIndex="0"
          aria-label={`Continue learning ${title}`}
        >
          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
        </Link>
      </div>
    </div>
  );
};

export default LessonCard; 