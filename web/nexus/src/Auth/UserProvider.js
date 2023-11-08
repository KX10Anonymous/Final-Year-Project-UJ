import React, { createContext, useContext, useMemo, useState } from "react";
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [jwt, setJwt] = useState("");
  const [role, setRole] = useState("");
  const [refresh, setRefreshToken] = useState("");
  const [fullName, setFullName] = useState("");

  const value = useMemo(() => ({
    jwt,
    setJwt,
    role,
    setRole,
    refresh,
    setRefreshToken,
    fullName,
    setFullName
  }), [jwt, role, refresh, fullName]);


  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
 
};

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

export { UserProvider, useUser };

