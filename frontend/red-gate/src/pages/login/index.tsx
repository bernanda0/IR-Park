import React, { Fragment, useEffect, useState } from "react";
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
  const [open, setOpen] = React.useState(false);
 
  const handleOpen = () => setOpen(!open);
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
    setOpen(true);
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
    setOpen(false);
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
          "Access-Control-Allow-Origin": "*"
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
          "Access-Control-Allow-Origin": "*"
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
    <div className="max-w-md mx-auto my-10 p-20 bg-gray-900 rounded-md shadow-lg">
      <h2 className="text-[50px] font-bold mb-6  text-red-700">RED-GATE</h2>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
      {isSignUp && (
          <div className="mb-4">
            <input
              type="text"
              id="username"
              className="w-full p-2 border rounded bg-gray-800"
              placeholder="Enter your username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
        )}
        <div className="mb-4">
          {/* <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label> */}
          <input
            type="email"
            id="email"
            className="w-full p-2 border rounded bg-gray-800"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="mb-4">
          {/* <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label> */}
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded bg-gray-800"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSignUp ? "Sign Up" : "Login"}
        </button>
        <div className="mt-4">
          <p
            className="text-white hover:underline hover:cursor-pointer"
            onClick={() => setIsSignUp((prev) => !prev)}
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </p>
        </div>
      </form>
      {showWarning && (
        <Popup message={errorMessage} onClose={handleCloseWarning} />
      )}
    
    </div>
  );
};

export default LoginForm;




// <Dialog open={open} handler={handleOpen} size={"xs"} animate={{
//   mount: { scale: 1, y: 0 },
//   unmount: { scale: 0.9, y: -100 },
// }}
// className="bg-black">
// <DialogHeader>Its a simple dialog.</DialogHeader>
// <DialogBody>
//   The key to more success is to have a lot of pillows. Put it this way,
//   it took me twenty five years to get these plants, twenty five years of
//   blood sweat and tears, and I&apos;m never giving up, I&apos;m just
//   getting started. I&apos;m up to something. Fan luv.
// </DialogBody>
// <DialogFooter>
//   <Button
//     variant="text"
//     color="red"
//     onClick={handleOpen}
//     className="mr-1"
//   >
//     <span>Cancel</span>
//   </Button>
//   <Button variant="gradient" color="green" onClick={handleOpen}>
//     <span>Confirm</span>
//   </Button>
// </DialogFooter>
// </Dialog>

// (
//   <>
//       <div className="fixed inset-0 z-10 overflow-y-auto">
//           <div
//               className="fixed inset-0 w-full h-full bg-black opacity-40"
//               onClick={() => setShowWarning(false)}
//           ></div>
//           <div className="flex items-center min-h-screen px-4 py-8">
//               <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
//                   <div className="mt-3 sm:flex">
//                       <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto bg-red-100 rounded-full">
//                           <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="w-6 h-6 text-red-600"
//                               viewBox="0 0 20 20"
//                               fill="currentColor"
//                           >
//                               <path
//                                   fillRule="evenodd"
//                                   d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                                   clipRule="evenodd"
//                               />
//                           </svg>
//                       </div>
//                       <div className="mt-2 text-center sm:ml-4 sm:text-left">
//                           <h4 className="text-lg font-medium text-gray-800">
//                               Delete account ?
//                           </h4>
//                           <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
//                               Lorem ipsum dolor sit amet,
//                               consectetur adipiscing elit, sed do
//                               eiusmod tempor incididunt ut labore
//                               et dolore magna aliqua.
//                           </p>
//                           <div className="items-center gap-2 mt-3 sm:flex">
//                               <button
//                                   className="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md outline-none ring-offset-2 ring-red-600 focus:ring-2"
//                                   onClick={() =>
//                                     setShowWarning(false)
//                                   }
//                               >
//                                   Delete
//                               </button>
//                               <button
//                                   className="w-full mt-2 p-2.5 flex-1 text-gray-800 rounded-md outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
//                                   onClick={() =>
//                                     setShowWarning(false)
//                                   }
//                               >
//                                   Cancel
//                               </button>
//                           </div>
//                       </div>
//                   </div>
//               </div>
//           </div>
//       </div>
//   </>
// )