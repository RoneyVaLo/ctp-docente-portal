import React from "react";

const Tooltip = ({ message, possition }) => {
  return (
    <div
      className={`absolute ${possition} left-1/2 transform -translate-x-1/2 mb-2
                              opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 
                              group-hover:scale-100 transition-all duration-150 ease-outbg-gray-800 text-white 
                              text-sm px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap bg-slate-500`}
    >
      {message}
    </div>
  );
};

export default Tooltip;
