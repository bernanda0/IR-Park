import {
  Route,
  Routes,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import LoginForm from "./pages/login";
import HomePage from "./pages/home";
import { AuthProvider } from "./auth/AuthProvider";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </>  
  );
}

export default App;
