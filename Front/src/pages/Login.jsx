import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
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

    useEffect(() => {
          window.scrollTo(0, 0);
        }, []);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

  /* ✅ INIT RECAPTCHA ONCE (MOST IMPORTANT FIX) */
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );

      // 👇 important
      window.recaptchaVerifier.render();
    }

    // ✅ cleanup (prevents production bugs)
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  /* ========= SEND OTP ========= */
  const sendOtp = async () => {
    if (!isValidPhone(phone)) {
      toast.error("Enter valid 10 digit phone number");
      return;
    }

    try {
      setIsLoading(true);

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        appVerifier
      );

      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent");

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ========= VERIFY OTP ========= */
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter valid OTP");
      return;
    }

    try {
      setIsLoading(true);

      const result = await confirmationResult.confirm(otp);
      const firebaseToken = await result.user.getIdToken();

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

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!otpSent) sendOtp();
    else verifyOtp();
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <section className="min-h-[calc(100vh-400px)] flex items-center justify-center px-4">
    <form onSubmit={onSubmitHandler} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Login with Phone</h1>

        {/* PHONE */}
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, ""))
          }
          maxLength={10}
          className="h-[44px] px-4 border rounded-lg"
          required
        />

        {/* OTP */}
        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="h-[44px] px-4 border rounded-lg"
          />
        )}

        {/* ✅ STABLE CONTAINER (DO NOT CHANGE) */}
        <div id="recaptcha-container"></div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-[44px] bg-purple-600 text-white rounded-lg"
        >
          {isLoading
            ? "Processing..."
            : otpSent
            ? "Verify OTP"
            : "Send OTP"}
        </button>
      </form>
    </section>
  );
}