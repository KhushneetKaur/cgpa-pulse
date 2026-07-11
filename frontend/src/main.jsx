import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/responsive.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}></GoogleOAuthProvider>

createRoot(document.getElementById("root")).render(
 <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
  <App />
</GoogleOAuthProvider>
);