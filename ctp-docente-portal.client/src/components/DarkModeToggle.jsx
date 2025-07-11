import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="group flex items-center gap-2 px-2 py-1 rounded-lg hover:opacity-90 transition relative overflow-hidden"
    >
      <div className="relative">
        {darkMode ? (
          <Sun
            size={20}
            className="transition duration-300 group-hover:drop-shadow-[0_0_6px_#facc15] group-hover:scale-110 group-hover:text-yellow-400"
          />
        ) : (
          <Moon
            size={20}
            className="transition duration-300  group-hover:scale-110 group-hover:text-sky-600"
          />
        )}
      </div>
    </button>
  );
};

export default DarkModeToggle;
