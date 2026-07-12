import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

export default function Login() {
  const { backendUrl, setToken, token, navigate } = useContext(ShopContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");   // inline error message
  const [info, setInfo] = useState("");      // inline success/info message

  // Reason for redirect (e.g. session expired), set by the auth interceptor.
  const [sessionNotice, setSessionNotice] = useState("");

  useEffect(() => {
    const reason = localStorage.getItem("authNotice");
    if (reason) {
      setSessionNotice(reason);
      localStorage.removeItem("authNotice");
    }
  }, []);

  const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

  /* ========= SEND OTP ========= */
  const sendOtp = async () => {
    setError("");
    setInfo("");

    if (!isValidPhone(phone)) {
      setError("Enter valid 10 digit phone number");
      return;
    }

    try {
      setIsLoading(true);

      await axios.post(backendUrl + "/api/auth/send-otp", { phone });

      setOtpSent(true);
      setInfo("OTP sent to your number");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /* ========= VERIFY OTP ========= */
  const verifyOtp = async () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Enter valid OTP");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(backendUrl + "/api/auth/verify-otp", {
        phone,
        otp,
      });

      const newToken = response.data.token;

      setToken(newToken);
      localStorage.setItem("token", newToken);
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP");
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
    <section className="min-h-[calc(100vh-400px)] flex items-center justify-center px-4 m-10">
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">Login with Phone</h1>

        {/* SESSION-EXPIRED / REDIRECT NOTICE */}
        {sessionNotice && (
          <p className="text-sm text-[#901CDB] bg-[#901CDB]/10 rounded-md px-3 py-2">
            {sessionNotice}
          </p>
        )}

        {/* INLINE INFO (e.g. OTP sent) */}
        {info && (
          <p className="text-sm text-green-600">{info}</p>
        )}

        {/* PHONE */}
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          maxLength={10}
          className="h-[44px] px-4 border rounded-lg"
          disabled={otpSent}
          required
        />

        {/* PHONE-STAGE ERROR (below phone box) */}
        {!otpSent && error && (
          <p className="text-sm text-red-500 -mt-2">{error}</p>
        )}

        {/* OTP */}
        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="h-[44px] px-4 border rounded-lg"
              autoFocus
            />

            {/* OTP-STAGE ERROR (below OTP box) */}
            {error && (
              <p className="text-sm text-red-500 -mt-2">{error}</p>
            )}
          </>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-[44px] bg-purple-600 text-white rounded-lg"
        >
          {isLoading ? "Processing..." : otpSent ? "Verify OTP" : "Send OTP"}
        </button>

        {/* CHANGE NUMBER */}
        {otpSent && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
            className="text-sm text-purple-600 underline"
          >
            Change number
          </button>
        )}
      </form>
    </section>
  );
}
