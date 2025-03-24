import React from 'react';

interface Membership {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  duration_days?: number;
  is_popular?: boolean;
}

interface MembershipCardProps {
  membership: Membership;
  isPopular?: boolean;
  onSelect: (membership: Membership) => void;
}

const MembershipCard = ({ membership, isPopular, onSelect }: MembershipCardProps) => {
  return (
    <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${isPopular || membership.is_popular ? 'border-2 border-gray-900' : ''}`}>
      {(isPopular || membership.is_popular) && (
        <div className="absolute top-0 right-0 bg-gray-900 text-white px-4 py-1 rounded-bl-lg">
          Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900">{membership.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">${membership.price.toLocaleString()}</span>
          <span className="text-gray-500 ml-2">/ mes</span>
        </div>
        <p className="mt-4 text-gray-600">{membership.description}</p>
        
        <ul className="mt-6 space-y-4">
          {membership.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="h-6 w-6 text-green-500 mr-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button
          onClick={() => onSelect(membership)}
          className={`mt-8 w-full py-3 px-4 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${isPopular || membership.is_popular
              ? 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900' 
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
            }`}
        >
          Seleccionar plan
        </button>
      </div>
    </div>
  );
};

export default MembershipCard;
