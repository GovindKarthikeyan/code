"use client";

import { useEffect, useState } from "react";

interface MFELoaderProps {
  mfeUrl: string;
  onLoad?: () => void;
}

/**
 * Component that loads the MFE web components by injecting a script
 * This approach loads the MFE page which automatically registers web components
 * globally when the page loads
 */
export default function MFELoader({ mfeUrl, onLoad }: MFELoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if components are already registered
    const checkAndLoad = () => {
      if (customElements.get('mfe-counter') && customElements.get('mfe-user-profile')) {
        setLoaded(true);
        onLoad?.();
        return true;
      }
      return false;
    };

    // Check immediately in case components were already loaded
    if (checkAndLoad()) {
      return;
    }

    // For development: Create a visible iframe that loads the MFE page
    // In production, you would use a script tag or module federation
    const iframe = document.createElement("iframe");
    iframe.src = mfeUrl;
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    
    let checkInterval: NodeJS.Timeout;
    
    iframe.onload = () => {
      // Poll for web components to be registered
      // They are registered in the parent window automatically
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total
      
      checkInterval = setInterval(() => {
        attempts++;
        
        if (checkAndLoad()) {
          clearInterval(checkInterval);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setError("Web components failed to register. Check console for errors.");
          setLoaded(true); // Mark as loaded to show error state
          onLoad?.();
        }
      }, 100);
    };

    iframe.onerror = () => {
      setError(`Failed to load MFE from ${mfeUrl}`);
      setLoaded(true);
    };
    
    document.body.appendChild(iframe);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
  }, [mfeUrl, onLoad]);

  return (
    <div className="text-sm">
      {error ? (
        <div className="text-red-600">✗ {error}</div>
      ) : loaded ? (
        <span className="text-green-600">✓ MFE Components Loaded</span>
      ) : (
        <span className="text-yellow-600">⟳ Loading MFE Components...</span>
      )}
    </div>
  );
}
