import React, { useEffect, useState } from "react";
import "../../App.css";
import "../../index.css";
import axios, { AxiosError, HttpStatusCode } from "axios";
import { useCookies } from "react-cookie";
import Popup from "../popup";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [, setCookie] = useCookies([
    "accessToken",
    "refreshToken",
    "accessTokenEx",
    "userID",
  ]);
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const instance = axios.create({
    baseURL: "http://localhost:4444/", // Replace with your API base UR
  });

  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    if (signUpSuccess) {
      login();
    }
  }, [signUpSuccess]);


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleShowWarning = (message: string) => {
    setErrorMessage(message);
    setShowWarning(true);
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
    setErrorMessage('');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    signUp()
  };

  const signUp = async () => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const resp = await instance.post("/auth/signup", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (resp.status == HttpStatusCode.Created) {
        setSignUpSuccess(true);
      }
    } catch (err) {
       if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError
        const errorMessage = axiosErr.response?.data;
        handleShowWarning(`An error occurred: ${errorMessage}`);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const login = async () => {
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);
    try {
      const resp = await instance.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (resp.status == 200) {
        const { access_token, access_token_expire, refresh_token, user_id } =
          resp.data as LoginResponseJson;
        setCookie("accessToken", access_token);
        setCookie("accessTokenEx", access_token_expire);
        setCookie("refreshToken", refresh_token);
        setCookie("userID", user_id);
      } 
    } catch(err) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError
        const errorMessage = axiosErr.response?.data;
        handleShowWarning(`An error occurred: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-md shadow-lg">
      <h2 className="text-[100px] font-bold mb-6 text-green-700">RED-GATE</h2>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        {isSignUp && (
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 border rounded"
              placeholder="Enter your username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSignUp ? "Sign Up" : "Login"}
        </button>
        <div className="mt-4">
          <button
            type="button"
            className="text-gray-700 hover:underline"
            onClick={() => setIsSignUp((prev) => !prev)}
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
      {showWarning && (
        <Popup message={errorMessage} onClose={handleCloseWarning} />
      )}
    </div>
  );
};

export default LoginForm;
