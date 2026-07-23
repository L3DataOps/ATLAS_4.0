import { createContext, useContext, useState } from "react";

const CaseContext = createContext();

export const CaseProvider = ({ children, initialCase }) => {
  const [caseItem, setCaseItem] = useState(initialCase);

  return (
    <CaseContext.Provider
      value={{
        caseItem,
        setCaseItem,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => useContext(CaseContext);
