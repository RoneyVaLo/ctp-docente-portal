import { createContext, useContext } from "react";
import { useEvaluationLogic } from "./useEvaluationLogic";

const EvaluationContext = createContext();

export const EvaluationProvider = ({ children }) => {
  const logic = useEvaluationLogic();

  return (
    <EvaluationContext.Provider value={logic}>
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => useContext(EvaluationContext);
