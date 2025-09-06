import { useState } from "react";
import ConfigurationTabs from "@/components/adminSettings/ConfigurationTabs";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("periods");

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  // TODO: Ver si añado un mensaje para que el usuario en mobile gire la pantalla para una mejor experiencia
  return (
    <div className="min-h-screen">
      <div className="container mx-auto relative">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Configuración del Sistema
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Panel administrativo para gestionar la operación académica
          </p>
        </div>

        <div className="space-y-6 mt-8">
          <ConfigurationTabs
            activeTab={activeTab}
            handleTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Configuration;
