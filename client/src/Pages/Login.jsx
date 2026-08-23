import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaRegStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { login } from "../api.js";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const data = await login(form);
      if (!data?.userId) {
        throw new Error("This login is not linked to a profile.");
      }
      navigate(`/edit/${data.userId}`, { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf4e9] px-4 py-10">
      <div className="w-full max-w-[430px] rounded-[24px] bg-white/45 p-[3px] shadow-[0_10px_28px_rgba(88,45,20,0.16)]">
        <section className="relative overflow-hidden rounded-[22px] border border-white bg-[#fffaf3] px-6 py-8 shadow-[inset_0_0_0_1px_rgba(232,205,167,0.55)] sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0)_45%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(246,226,200,0.16))]" />

          <div className="relative z-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#5d0618] text-white shadow-[0_8px_22px_rgba(104,3,22,0.28)]">
              <FaLock size={24} />
            </div>
            <h1 className="mt-5 text-center font-serif text-3xl font-bold text-[#5d0618]">Starlink Profile</h1>
            <div className="mx-auto mt-3 flex max-w-[230px] items-center gap-3">
              <span className="h-px flex-1 bg-[#e8cda7]" />
              <FaRegStar className="text-[#d9aa62]" size={11} />
              <span className="h-px flex-1 bg-[#e8cda7]" />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-[#8d8178]">Sign in to edit your digital profile.</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7b1223]">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  autoComplete="email"
                  required
                  className="w-full rounded-[12px] border border-[#ead9c9] bg-white px-4 py-3 text-[#3c3130] outline-none transition focus:border-[#8d061c] focus:ring-2 focus:ring-[#8d061c]/10"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#7b1223]">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-[12px] border border-[#ead9c9] bg-white px-4 py-3 pr-12 text-[#3c3130] outline-none transition focus:border-[#8d061c] focus:ring-2 focus:ring-[#8d061c]/10"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7b1223]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>

              {message ? (
                <p className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{message}</p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[12px] bg-[#5d0618] px-4 py-3.5 text-sm font-bold text-white shadow-[0_7px_16px_rgba(104,3,22,0.28)] transition hover:bg-[#690316] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Open Profile Editor"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
