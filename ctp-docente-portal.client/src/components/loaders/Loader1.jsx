import React from "react";

const Loader1 = () => {
  return (
    <div className="fixed inset-0 z-[52] flex items-center justify-center bg-slate-700 bg-opacity-80">
      {/* <span className="loader"></span> */}
      <span className="w-16 h-16 border-8 border-solid border-white border-b-slate-900 rounded-full inline-block box-border loader"></span>
    </div>
  );
};

export default Loader1;
