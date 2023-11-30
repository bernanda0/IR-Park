import React from "react";

interface DisplayIDComponentProps {
  plateID: string;
  isSubscribe: boolean;
}

const DisplayIDComponent: React.FC<DisplayIDComponentProps> = (props) => {
  const { plateID, isSubscribe } = props;

  return (
    <div className="flex items-center relative bg-black pr-8 pl-4 mb-12 pt-8 pb-8 rounded-md shadow-md">
      <div className="absolute left-0 top-0 bottom-0 bg-red-500 w-16 rounded-l-md"></div>
      <div className="flex w-16"></div>
      <div className="text-white"> {/* Add a container for the styled text */}
        <p className="mb-2">ID <span className="font-bold text-4xl">{plateID}</span></p>
        <p><span className={isSubscribe ? 'text-green-500' : 'text-red-500'}>{isSubscribe ? "Subscribed" : "Not Subscribed"}</span></p>
      </div>
    </div>
    
  );
};

export default DisplayIDComponent;
