"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2000}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
    />
  );
}
