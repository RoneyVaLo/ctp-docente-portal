import { useCallback } from "react";
import axios from "axios";

export const useDownloadPdf = () => {
  const downloadPdf = useCallback(async (url, body, filename) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(url, body, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || "Reporte.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Error descargando PDF:", error);
    }
  }, []);

  return { downloadPdf };
};
