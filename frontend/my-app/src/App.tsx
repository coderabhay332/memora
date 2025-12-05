import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import MemoraLanding from "./pages/landing";
import ContentRoute from "./pages/content";
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <>
      <Toaster position="top-center" />
    <Routes>

    
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/content/:id" element={<ContentRoute />} />
      <Route path="/" element={<MemoraLanding />} />
      <Route path="/home" element={<MemoraLanding />} />
    </Routes>
    </>
  );
}

export default App;