"use client";

import React from "react";
import { createRoot, Root } from "react-dom/client";

/**
 * Creates a web component wrapper for a React component
 * This allows React components to be used as custom HTML elements
 */
export function createWebComponent(
  Component: React.ComponentType<any>,
  tagName: string,
  observedAttributes: string[] = [],
  targetWindow: Window & typeof globalThis = window
) {
  class ReactWebComponent extends HTMLElement {
    private root: Root | null = null;
    private mountPoint: HTMLDivElement | null = null;

    static get observedAttributes() {
      return observedAttributes;
    }

    connectedCallback() {
      // Create mount point for React
      this.mountPoint = document.createElement("div");
      
      // Create shadow DOM for style isolation
      const shadowRoot = this.attachShadow({ mode: "open" });
      
      // Add Tailwind CSS and styles to shadow DOM
      const style = document.createElement("style");
      style.textContent = this.getStyles();
      shadowRoot.appendChild(style);
      shadowRoot.appendChild(this.mountPoint);

      // Create React root and render
      this.root = createRoot(this.mountPoint);
      this.render();
    }

    disconnectedCallback() {
      // Cleanup when element is removed
      if (this.root) {
        this.root.unmount();
        this.root = null;
      }
    }

    attributeChangedCallback() {
      // Re-render when attributes change
      if (this.root) {
        this.render();
      }
    }

    private render() {
      if (!this.root) return;

      // Convert attributes to props
      const props: Record<string, any> = {};
      observedAttributes.forEach((attr) => {
        const value = this.getAttribute(attr);
        if (value !== null) {
          // Try to parse as JSON, fallback to string
          try {
            props[attr] = JSON.parse(value);
          } catch {
            props[attr] = value;
          }
        }
      });

      this.root.render(React.createElement(Component, props));
    }

    private getStyles(): string {
      // Inline critical Tailwind styles
      // In production, you'd want to extract and inline the actual CSS
      return `
        * {
          box-sizing: border-box;
        }
        
        :host {
          display: block;
        }

        /* Tailwind base utilities - inline critical styles */
        .p-6 { padding: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-md { border-radius: 0.375rem; }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-to: rgb(59 130 246 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
        .to-purple-600 { --tw-gradient-to: #9333ea; }
        .from-green-500 { --tw-gradient-from: #22c55e; --tw-gradient-to: rgb(34 197 94 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
        .to-teal-600 { --tw-gradient-to: #0d9488; }
        .text-white { color: rgb(255 255 255); }
        .text-blue-600 { color: rgb(37 99 235); }
        .text-purple-600 { color: rgb(147 51 234); }
        .text-green-600 { color: rgb(22 163 74); }
        .text-red-500 { color: rgb(239 68 68); }
        .text-gray-900 { color: rgb(17 24 39); }
        .bg-white { background-color: rgb(255 255 255); }
        .bg-gray-100 { background-color: rgb(243 244 246); }
        .bg-red-500 { background-color: rgb(239 68 68); }
        .bg-red-600 { background-color: rgb(220 38 38); }
        .flex { display: flex; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .w-full { width: 100%; }
        .block { display: block; }
        .opacity-80 { opacity: 0.8; }
        
        button {
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        
        button:hover {
          transform: translateY(-1px);
        }
        
        input {
          border: 1px solid #e5e7eb;
          outline: none;
        }
        
        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `;
    }
  }

  // Register the custom element if not already registered
  if (!targetWindow.customElements.get(tagName)) {
    targetWindow.customElements.define(tagName, ReactWebComponent);
  }

  return ReactWebComponent;
}
