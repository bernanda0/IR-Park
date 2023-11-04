import {
  BrowserRouter,
  Navigate,
  Route,
  Router,
  RouterProvider,
  Routes,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import LoginForm from "./page/login";
import HomePage from "./page/home";
import { AuthProvider } from "./auth/AuthProvider";

function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthProvider>
  );
}

export default App;
