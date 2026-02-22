import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/shopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

export default function Login() {
  const { backendUrl, setToken, token, navigate } =
    useContext(ShopContext);

  const [currentState, setCurrentState] = useState("Login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidPhone = (phone) =>
    /^[0-9]{10}$/.test(phone);

  /* ========= SEND OTP ========= */
  const sendOtp = async () => {
    if (!isValidPhone(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    try {
      setIsLoading(true);

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      const fullPhone = "+91" + phone;

      const result = await signInWithPhoneNumber(
        auth,
        fullPhone,
        window.recaptchaVerifier
      );

      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent successfully");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ========= VERIFY OTP ========= */
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6 digit OTP");
      return;
    }

    try {
      setIsLoading(true);

      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const firebaseToken = await firebaseUser.getIdToken();

      // Send firebase token to backend
      const response = await axios.post(
        backendUrl + "/api/auth/firebase-login",
        { firebaseToken }
      );

      const token = response.data.token;

      setToken(token);
      localStorage.setItem("token", token);

      toast.success("Login successful");

    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    if (currentState === "Sign Up") {
      /* KEEPING SIGNUP LOGIC SAME */
      try {
        setIsLoading(true);

        const response = await axios.post(
          backendUrl + "/api/auth/register",
          { name, email, password, phone, role: "USER" }
        );

        const token = response.data.token;
        setToken(token);
        localStorage.setItem("token", token);
        toast.success("Signup successful!");

      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Something went wrong"
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!otpSent) {
        sendOtp();
      } else {
        verifyOtp();
      }
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        <div className="max-w-[640px]">

          <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-2">
            {currentState}
          </h1>

          <p className="text-sm md:text-base text-[#777E90] mb-6 md:mb-8">
            {currentState === "Login"
              ? "Welcome back! Please login to continue."
              : "Create your account to get started."}
          </p>

          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col gap-4 md:gap-5"
          >

            {currentState === "Sign Up" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#141416]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                  required
                />
              </div>
            )}

            {(currentState === "Sign Up" || currentState === "Login") && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#141416]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
                  className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                  required
                />
              </div>
            )}

            {currentState === "Sign Up" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#141416]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 relative">
                  <label className="text-sm font-medium text-[#141416]">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[44px] px-4 pr-12 border border-[#E6E8EC] rounded-lg text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[36px] text-gray-500 text-sm"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </>
            )}

            {currentState === "Login" && otpSent && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#141416]">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full h-[44px] px-4 border border-[#E6E8EC] rounded-lg text-sm"
                />
              </div>
            )}

            <div id="recaptcha-container"></div>

            <div className="flex justify-between text-sm mt-1">
              {currentState === "Login" ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentState("Sign Up");
                    setOtpSent(false);
                  }}
                  className="text-[#901CDB]"
                >
                  Create Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentState("Login")}
                  className="text-[#901CDB]"
                >
                  Login Here
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full sm:w-[200px] h-[44px] bg-[#901CDB] text-white rounded-lg text-base font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-60"
            >
              {isLoading
                ? "Processing..."
                : currentState === "Login"
                ? otpSent
                  ? "Verify OTP"
                  : "Send OTP"
                : "Sign Up"}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
