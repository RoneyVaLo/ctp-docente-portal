import React from "react";

const TabsContent = ({ value, activeTab, children }) => {
  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${
        activeTab === value ? "block" : "hidden"
      }`}
    >
      {children}
    </div>
  );
};

export default TabsContent;
