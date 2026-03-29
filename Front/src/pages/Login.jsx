import { useContext, useEffect, useState, useRef } from "react";
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

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recaptchaRef = useRef(null);

  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

  /* INIT RECAPTCHA ONCE */
  useEffect(() => {
    if (!window.recaptchaVerifier && recaptchaRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaRef.current,
        { size: "invisible" }
      );
    }
  }, []);

  /* SEND OTP */
  const sendOtp = async () => {
    if (!isValidPhone(phone)) {
      toast.error("Enter valid 10 digit phone number");
      return;
    }

    try {
      setIsLoading(true);

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        window.recaptchaVerifier
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

  /* VERIFY OTP */
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

    if (!otpSent) {
      sendOtp();
    } else {
      verifyOtp();
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-[400px] mx-auto px-4 py-12">

        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <p className="text-gray-500 mb-6">
          Enter your phone number
        </p>

        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">

          {/* PHONE */}
          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, ""))
            }
            maxLength={10}
            placeholder="Enter phone number"
            className="h-[44px] px-4 border rounded-lg"
            required
          />

          {/* OTP */}
          {otpSent && (
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="Enter OTP"
              className="h-[44px] px-4 border rounded-lg"
            />
          )}

          {/* RECAPTCHA */}
          <div ref={recaptchaRef}></div>

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
      </div>
    </section>
  );
}