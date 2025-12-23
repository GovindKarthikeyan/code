"use client";

import { useEffect, useState } from "react";

interface MFELoaderProps {
  mfeUrl: string;
  onLoad?: () => void;
}

/**
 * Component that loads the MFE application and registers web components
 * This creates a hidden iframe that loads the MFE page, triggering web component registration
 */
export default function MFELoader({ mfeUrl, onLoad }: MFELoaderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Create a hidden iframe to load the MFE and trigger web component registration
    const iframe = document.createElement("iframe");
    iframe.src = mfeUrl;
    iframe.style.display = "none";
    iframe.onload = () => {
      setLoaded(true);
      onLoad?.();
    };
    
    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, [mfeUrl, onLoad]);

  return (
    <div className="text-sm text-gray-600">
      {loaded ? (
        <span className="text-green-600">✓ MFE Components Loaded</span>
      ) : (
        <span className="text-yellow-600">⟳ Loading MFE Components...</span>
      )}
    </div>
  );
}
