import axios from "axios";
import { useCallback } from "react";

export const useDownloadCsv = () => {
  const downloadCsv = useCallback(async (url, body, filename) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(url, body, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || "Reporte.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Error descargando CSV:", error);
    }
  }, []);

  return { downloadCsv };
};
