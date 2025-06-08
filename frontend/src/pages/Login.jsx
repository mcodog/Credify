import React, { useState, useEffect } from "react";
import TextInput from "../components/inputs/TextInput";
import PrimeButton from "../components/buttons/PrimeButton";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/user/userSlice";
import { selectUser } from "../features/user/userSelector";
import Gradient from "../components/gradient/Gradient";
import Logo from "../assets/Credify.png";

const Login = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Form validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(formData.email);
    const isPasswordValid = formData.password.length >= 6;
    
    setIsFormValid(isEmailValid && isPasswordValid);
    
    // Clear errors when user starts typing
    if (errors.email && formData.email) setErrors(prev => ({ ...prev, email: '' }));
    if (errors.password && formData.password) setErrors(prev => ({ ...prev, password: '' }));
  }, [formData, errors.email, errors.password]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e?.preventDefault();
  
  if (!validateForm() || isLoading) return;
  
  setIsLoading(true);
  
  try {
    console.log('logging in')
    const res = await axios.post("/auth/login", formData);
    if (res.data.message === "Success") {
      await Swal.fire({
        title: "Welcome Back!",
        text: "Login successful. Redirecting...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        backdrop: 'rgba(0,0,0,0.8)',
        customClass: {
          popup: 'animate__animated animate__fadeInDown'
        }
      });
      
      dispatch(setUser(res.data.parsedUser));
      
      // Check user role and redirect accordingly
      if (res.data.parsedUser.role === 'admin') {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  } catch (e) {
    console.log(e)
    setIsLoading(false);
      
      if (e.response?.data?.message === "invalid_credentials") {
        Swal.fire({
          title: "Invalid Credentials",
          text: "Please check your email and password.",
          icon: "error",
          confirmButtonText: "Try Again",
          backdrop: 'rgba(0,0,0,0.8)',
          customClass: {
            popup: 'animate__animated animate__shakeX'
          }
        });
        setErrors({ password: 'Invalid email or password' });
      } else if (e.response?.data?.message === "email_not_confirmed") {
        Swal.fire({
          title: "Account Unverified",
          text: "Please verify your account first. Check your email for verification link.",
          icon: "warning",
          confirmButtonText: "Resend Verification",
          showCancelButton: true,
          cancelButtonText: "OK",
          backdrop: 'rgba(0,0,0,0.8)'
        }).then((result) => {
          if (result.isConfirmed) {
            // Add resend verification logic here
            console.log("Resend verification email");
          }
        });
      } else {
        Swal.fire({
          title: "Connection Error",
          text: "Unable to connect to server. Please try again.",
          icon: "error",
          backdrop: 'rgba(0,0,0,0.8)'
        });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid && !isLoading) {
      handleSubmit(e);
    }
  };

  const handleReturn = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="font-poppins w-full h-screen">
      <div className="fixed overflow-hidden w-full h-full">
        <Gradient />
      </div>

      <div className="h-full w-full flex items-center justify-center lg:justify-center px-4 lg:px-8">
        <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg min-h-[600px] lg:h-[600px] bg-[var(--tertiary-color)] rounded-2xl lg:rounded-4xl header-shadow flex flex-col items-center p-6 sm:p-8 lg:p-12 transform transition-all duration-500 hover:scale-[1.02] animate__animated animate__fadeInUp">
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-4xl flex items-center justify-center z-50">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-[var(--secondary-color)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Signing you in...</p>
              </div>
            </div>
          )}

          <div className="text-center mb-6 lg:mb-8">
            <div className="flex flex-col items-center space-y-2 mb-4">
              <div className="w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 transition-transform duration-300 hover:scale-110">
                <img
                  src={Logo}
                  alt="Credify"
                  className="w-full h-auto drop-shadow-sm"
                />
              </div>
            </div>
            <div className="text-xs sm:text-[13px] uppercase -mt-1 lg:-mt-2 text-gray-600 animate__animated animate__fadeIn animate__delay-1s">
              Verify your certificates with Credify
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-grow w-full justify-center items-center space-y-4 lg:space-y-6" onKeyPress={handleKeyPress}>
            <div className="w-full transform transition-all duration-300 hover:translate-y-[-2px]">
              <TextInput
                maxWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                handleChange={handleChange}
                error={errors.email}
                placeholder="Enter your email address"
                autoComplete="email"
                disabled={isLoading}
                className="transition-all duration-300 focus:scale-[1.02]"
              />
            </div>
            
            <div className="w-full transform transition-all duration-300 hover:translate-y-[-2px] relative">
              <TextInput
                maxWidth
                password={!showPassword}
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                handleChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                className="transition-all duration-300 focus:scale-[1.02] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-5 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] focus:ring-opacity-50"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-2 mt-4 lg:mt-6">
              <PrimeButton
                secondary
                label="Go Back"
                onClick={handleReturn}
                className="w-full sm:w-auto transition-all duration-300 hover:scale-105 disabled:opacity-50"
                disabled={isLoading}
              />
              <PrimeButton
                type="submit"
                label={isLoading ? "Signing In..." : "Login"}
                onClick={handleSubmit}
                className={`w-full sm:w-auto transition-all duration-300 hover:scale-105 ${
                  isFormValid && !isLoading 
                    ? 'hover:shadow-lg transform hover:translate-y-[-1px]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isFormValid || isLoading}
              />
            </div>

            <div className="border-b w-full my-4 opacity-30"></div>

            <div className="text-center text-sm lg:text-base transition-all duration-300 hover:scale-105">
              Don't have an account? &nbsp;
              <Link
                to="/register"
                className="text-[var(--secondary-color)] font-bold hover:underline transition-all duration-200 hover:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--secondary-color)] focus:ring-opacity-50 rounded px-1"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
