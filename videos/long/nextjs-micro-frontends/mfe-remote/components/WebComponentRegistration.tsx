"use client";

import { useEffect } from "react";
import Counter from "@/components/Counter";
import UserProfile from "@/components/UserProfile";
import { createWebComponent } from "@/lib/webComponentWrapper";

/**
 * Component that registers web components on the client side
 * This ensures web components are registered in the correct window context
 * If loaded in an iframe, it registers in both iframe and parent window (if same-origin)
 */
export default function WebComponentRegistration() {
  useEffect(() => {
    const registerComponents = (targetWindow: Window & typeof globalThis) => {
      // Register Counter as a web component
      if (!targetWindow.customElements.get("mfe-counter")) {
        createWebComponent(Counter, "mfe-counter", [], targetWindow);
      }

      // Register UserProfile as a web component
      if (!targetWindow.customElements.get("mfe-user-profile")) {
        createWebComponent(UserProfile, "mfe-user-profile", [
          "initialName",
          "initialEmail",
        ], targetWindow);
      }
    };

    // Register in current window
    registerComponents(window);

    // If we're in an iframe and can access parent (same-origin), register there too
    try {
      if (window !== window.parent && window.parent) {
        registerComponents(window.parent);
        console.log("Web components registered in parent window");
      }
    } catch (error) {
      // Cross-origin error - can't access parent window
      console.log("Cannot register in parent window (cross-origin)");
    }

    console.log("Web components registered successfully");
  }, []);

  return null; // This component doesn't render anything
}

