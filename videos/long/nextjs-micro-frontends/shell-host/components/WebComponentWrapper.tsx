"use client";

import { useEffect, useRef } from "react";

/**
 * Wrapper component for MFE web components
 * This ensures the web component is only rendered on the client side
 */
interface WebComponentProps {
  tag: string;
  attributes?: Record<string, string>;
  children?: React.ReactNode;
}

export default function WebComponentWrapper({
  tag,
  attributes = {},
  children,
}: WebComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Create the custom element
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    // Append to container
    ref.current.appendChild(element);

    return () => {
      // Cleanup
      if (ref.current && ref.current.contains(element)) {
        ref.current.removeChild(element);
      }
    };
  }, [tag, attributes]);

  return <div ref={ref}>{children}</div>;
}
