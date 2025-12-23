"use client";

import { useEffect } from "react";
import Counter from "@/components/Counter";
import UserProfile from "@/components/UserProfile";
import { createWebComponent } from "@/lib/webComponentWrapper";

/**
 * Component that registers web components on the client side
 * This ensures web components are only registered in the browser
 */
export default function WebComponentRegistration() {
  useEffect(() => {
    // Register Counter as a web component
    createWebComponent(Counter, "mfe-counter", []);

    // Register UserProfile as a web component
    createWebComponent(UserProfile, "mfe-user-profile", [
      "initialName",
      "initialEmail",
    ]);

    console.log("Web components registered successfully");
  }, []);

  return null; // This component doesn't render anything
}
