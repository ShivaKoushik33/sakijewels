import { useState } from "react";
import { signupUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 🔥 toggle state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 🔥 Phone validation (10 digits only)
  const isValidPhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Frontend validations
    if (!form.name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const data = await signupUser(form);

      console.log("Signup success:", data);

      navigate("/login");

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        <div className="max-w-[480px]">
          <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-2">
            Create Account
          </h1>
          <p className="text-sm md:text-base text-[#777E90] mb-6 md:mb-8">
            Sign up to start shopping with us
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#141416]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(e) => {
                  // allow only digits
                  const value = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, phone: value });
                }}
                maxLength={10}
                className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 relative">
              <label className="text-sm font-medium text-[#141416]">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full h-[44px] px-4 pr-12 border border-[#E6E8EC] rounded-lg text-sm"
                placeholder="Create a password"
              />

              {/* 🔥 Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[36px] text-sm text-[#901CDB]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
