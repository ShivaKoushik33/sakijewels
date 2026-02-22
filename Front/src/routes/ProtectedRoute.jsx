import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShopContext } from "../context/shopContext";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(ShopContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
