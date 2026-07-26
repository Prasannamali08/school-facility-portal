import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FiMail,
  FiLock,
  FiClipboard,
  FiBell,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const background =
  "https://res.cloudinary.com/mg7foqao/image/upload/v1785063441/login_background_chevs1.png";

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
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>

      <div className="relative z-10 flex min-h-screen">

        {/* LEFT SECTION */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-14 text-white">

          <div>
            <h2 className="text-3xl font-bold">
              School Facility Portal
            </h2>

            <p className="text-lg text-gray-200 mt-2">
              Report. Track. Resolve.
            </p>

            <div className="mt-24">

              <h1 className="text-6xl font-extrabold leading-tight">
                School Facility
                <br />
                Condition Reporting
                <br />
                & Repair Tracking
                <br />
                Portal
              </h1>

              <div className="w-28 h-1 bg-blue-500 rounded mt-6 mb-8"></div>

              <p className="text-xl text-gray-200 leading-10 max-w-xl">
                A smart platform to report school facility issues,
                monitor repair progress, and maintain a safe,
                clean, and efficient learning environment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 mt-16">

              <div className="flex gap-4">
                <FiClipboard size={34} className="text-blue-400" />

                <div>
                  <h3 className="font-bold text-lg">
                    Easy Reporting
                  </h3>

                  <p className="text-gray-300">
                    Report issues quickly with images.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <FiTrendingUp size={34} className="text-green-400" />

                <div>
                  <h3 className="font-bold text-lg">
                    Track Progress
                  </h3>

                  <p className="text-gray-300">
                    Monitor every repair in real time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <FiBell size={34} className="text-purple-400" />

                <div>
                  <h3 className="font-bold text-lg">
                    Notifications
                  </h3>

                  <p className="text-gray-300">
                    Stay updated on every status change.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <FiShield size={34} className="text-yellow-400" />

                <div>
                  <h3 className="font-bold text-lg">
                    Better Campus
                  </h3>

                  <p className="text-gray-300">
                    Improve school safety and facilities.
                  </p>
                </div>
              </div>

            </div>

          </div>

          <p className="text-gray-300 text-lg">
            Better facilities, better learning, brighter future.
          </p>

        </div>

        {/* LOGIN CARD */}
        <div className="w-full lg:w-1/2 flex items-center justify-end px-8 lg:px-20">

          <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl p-10">

            <h2 className="text-4xl font-bold text-center text-gray-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-center text-gray-500 mb-8">
              Sign in to your account
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >

              {/* Email */}

              <div>

                <label className="block font-semibold mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <FiMail className="absolute left-4 top-4 text-gray-400" />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-field pl-12"
                    {...register("email", {
                      required: "Email is required",
                    })}
                  />

                </div>

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

                <div className="relative">

                  <FiLock className="absolute left-4 top-4 text-gray-400" />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input-field pl-12"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />

                </div>

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
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold text-lg"
              >
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