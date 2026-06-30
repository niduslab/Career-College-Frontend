"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Mounts the single app-wide toast container. Rendered once in the root
 * layout; call `toast.*` from `@/lib/toast` anywhere to show messages.
 */
export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
    />
  );
}
