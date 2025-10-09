import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    hasProcessed.current = true;

    if (error) {
      navigate("/login?error=" + encodeURIComponent(error));
      return;
    }

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        login(userData);
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500); // 2.5 segundos
      } catch (err) {
        console.error("Error al procesar callback de Google:", err);
        navigate("/login?error=" + encodeURIComponent("Error al procesar la autenticación"));
      }
    } else {
      // No hay token, redirigir al login
      navigate("/login");
    }
  }, []); // Dependencias vacías para evitar re-renders

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6">
          <div className="w-full h-full border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Procesando autenticación...
        </h2>
        <p className="text-white/80">
          Por favor espera mientras completamos tu inicio de sesión con Google.
        </p>
      </div>
    </div>
  );
}
