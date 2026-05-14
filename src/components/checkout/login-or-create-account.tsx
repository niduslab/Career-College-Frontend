"use client";
import { useState } from "react";

export default function LoginOrCreateAccount() {
  const [mode, setMode] = useState<"login" | "create">("login");

  return (
    <div className="bg-white rounded-lg  border border-gray-200 p-6">
      <h2 className="sg-p-big lg:sg-h5 font-semibold text-[#12100e] mb-4">
        Login or Create Account
      </h2>

      {/* Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label
          onClick={() => setMode("login")}
          className={`flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-sm lg:sg-p-default sg-p-small  font-medium cursor-pointer transition-colors ${
            mode === "login" ? "text-[#12100E]" : "text-[#4E4758]"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              mode === "login"
                ? "border-(--primary-700) bg-(--primary-700)"
                : "border-gray-300"
            }`}
          >
            {mode === "login" && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </span>
          I have an account
        </label>
        <label
          onClick={() => setMode("create")}
          className={`flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-sm lg:sg-p-default sg-p-small  font-medium cursor-pointer transition-colors ${
            mode === "create" ? "text-[#12100E]" : "text-[#4E4758]"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              mode === "create"
                ? "border-(--primary-700) bg-(--primary-700)"
                : "border-gray-300"
            }`}
          >
            {mode === "create" && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </span>
          Create Account
        </label>
      </div>

      <p className="sg-p-small text-(--text-paragraph) mb-4">
        {mode === "login"
          ? "Please log in to continue with your checkout"
          : "Please create an account to continue with your checkout"}
      </p>

      <button className="bg-(--primary-700) text-white sg-p-default font-semibold px-6 py-2.5 rounded-md cursor-pointer hover:opacity-90 transition-opacity">
        {mode === "login" ? "Login to Your Account" : "Create to Your Account"}
      </button>
    </div>
  );
}
