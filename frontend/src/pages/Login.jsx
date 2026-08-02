import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FiClipboard,
  FiBell,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const background =
  "https://res.cloudinary.com/mg7foqao/image/upload/v1785076035/Login_page_ryfqa1.png";
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);

      login(data.user, data.token);

      toast.success("Welcome back!");

      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
    className="relative min-h-screen bg-cover bg-center"
    style={{
      backgroundImage: `url(${background})`,
    }}
  >
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>

    {/* Main Content */}
    <div className="relative z-10 min-h-screen lg:grid lg:grid-cols-2 flex flex-col">

      {/* ================= LEFT SECTION START ================= */}

    <div className="flex flex-col justify-center text-white
          px-6 md:px-10 lg:px-16 xl:px-20
          py-10 lg:py-0">
        <h2 className="text-3xl font-bold">
          School Facility Portal
        </h2>

        <p className="text-lg mt-2 text-gray-200">
          Report. Track. Resolve.
        </p>

        <h1 className="text-3xl md:text-5xl xl:text-6xl font-extrabold">
           School Facility
          <br />
          Condition Reporting &
          <br />
          Repair Tracking Portal
        </h1>

        <div className="w-24 h-1 bg-blue-500 rounded mt-6 mb-8"></div>
<p className="text-lg xl:text-xl text-gray-200 leading-8 max-w-xl mt-6">
  A smart platform for reporting, tracking,
  and managing school facility issues efficiently,
  ensuring a safer learning environment.
</p>

{/* Features */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

  <div className="flex items-start gap-3">
    <FiClipboard className="text-blue-400 text-2xl mt-1" />
    <div>
      <h3 className="font-semibold">Easy Reporting</h3>
      <p className="text-gray-300 text-sm">
        Report facility issues quickly.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-3">
    <FiTrendingUp className="text-green-400 text-2xl mt-1" />
    <div>
      <h3 className="font-semibold">Track Progress</h3>
      <p className="text-gray-300 text-sm">
        Monitor issue status in real time.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-3">
    <FiBell className="text-yellow-400 text-2xl mt-1" />
    <div>
      <h3 className="font-semibold">Notifications</h3>
      <p className="text-gray-300 text-sm">
        Receive instant status updates.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-3">
    <FiShield className="text-purple-400 text-2xl mt-1" />
    <div>
      <h3 className="font-semibold">Secure Access</h3>
      <p className="text-gray-300 text-sm">
        Protected with JWT authentication.
      </p>
    </div>
  </div>

</div>
</div>
        
        {/* LOGIN CARD */}
  <div className="flex justify-center items-center
                px-5 md:px-8 lg:px-20
                pb-8 lg:pb-0">
<div className="
                          w-full
                          max-w-sm
                          sm:max-w-md
                          lg:max-w-[430px]
                          rounded-3xl
                          bg-white/95
                          backdrop-blur-xl
                          shadow-2xl
                          p-5
                          sm:p-6
                          lg:p-8
                        ">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
                Welcome Back
            </h2>

            <p className="text-center text-gray-500 mb-8">
              Sign in to your account
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label className="block font-semibold mb-2">
                  Email Address
                </label>

                                <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-field"
                    {...register("email", {
                      required: "Email is required",
                    })}
                  />

                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* Password */}

              <div>

                <label className="block font-semibold mb-2">
                  Password
                </label>

                      <input
                type="password"
                placeholder="Enter your password"
                className="input-field"
                {...register("password", {
                  required: "Password is required",
                })}
              />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}

              </div>

              <div className="text-right">

                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:underline text-sm"
                >
                  Forgot Password?
                </Link>

              </div>

              <button
                type="submit"
                disabled={loading}
               className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-semibold">
                {loading ? "Signing In..." : "Sign In"}
              </button>

            </form>

            <p className="text-center text-gray-500 mt-8">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="text-primary-600 font-semibold hover:underline"
              >
                Register
              </Link>

            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;