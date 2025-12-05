import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginComponent from "../components/LoginForm";
import { useMeQuery } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const hasToken = Boolean(localStorage.getItem("access_token"));
  const { data, isLoading, error } = useMeQuery(undefined, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (hasToken && !isLoading && data?.success) {
      navigate("/dashboard", { replace: true });
    }
  }, [hasToken, isLoading, data, navigate]);

  if (hasToken && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4 text-gray-600">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (hasToken && !isLoading && !error && data?.success) {
    return null;
  }

    return (
      <div>
        <LoginComponent />
      </div>
    );
};

export default Login;