# Next.js Micro Frontends with Web Components

This project demonstrates a modern micro frontend architecture using Next.js and Web Components. It consists of two Next.js applications:

1. **MFE Remote** (Port 3001): Exposes React components as Web Components
2. **Shell Host** (Port 3000): Consumes and integrates the micro frontend components

## Architecture Overview

### Key Features

- ✅ **Server-Side Rendering (SSR)**: The shell host page is server-side rendered by Next.js
- ✅ **Web Components**: MFE components are wrapped as custom HTML elements
- ✅ **Client-Side Hydration**: Web components hydrate React components on the client
- ✅ **Style Isolation**: Shadow DOM ensures CSS encapsulation
- ✅ **Independent Deployment**: Each MFE can be developed and deployed separately

### How It Works

1. **MFE Remote Application**:
   - Defines React components (`Counter`, `UserProfile`)
   - Wraps them as Web Components using a custom wrapper
   - Registers them as custom elements (`<mfe-counter>`, `<mfe-user-profile>`)
   - Exposes an API endpoint for component metadata

2. **Shell Host Application**:
   - Loads the MFE Remote page in a hidden iframe
   - This triggers the registration of web components
   - Uses the web components in its pages like regular HTML elements
   - The shell itself is SSR'd by Next.js
   - Web components hydrate on the client side

3. **SSR + Hydration Flow**:
   ```
   Server (Shell Host) → Renders HTML with placeholder for web components
                      ↓
   Client (Browser)   → Loads MFE iframe → Registers web components
                      ↓
   Client (Browser)   → Web components mount and hydrate with React
   ```

## Project Structure

```
nextjs-micro-frontends/
├── mfe-remote/                 # Micro Frontend Remote App
│   ├── app/
│   │   ├── api/
│   │   │   └── components/     # API endpoint for component info
│   │   ├── layout.tsx
│   │   └── page.tsx           # Demo page showing components
│   ├── components/
│   │   ├── Counter.tsx        # Sample counter component
│   │   ├── UserProfile.tsx    # Sample user profile component
│   │   └── WebComponentRegistration.tsx
│   ├── lib/
│   │   └── webComponentWrapper.tsx  # Web Component wrapper utility
│   └── package.json
│
└── shell-host/                # Shell Host App
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx           # Main page consuming MFE components
    ├── components/
    │   ├── MFELoader.tsx      # Loads MFE and registers components
    │   └── WebComponentWrapper.tsx  # Wrapper for web components
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation & Running

1. **Start the MFE Remote application** (must be started first):

```bash
cd mfe-remote
npm install
npm run dev
```

The MFE Remote will run on http://localhost:3001

2. **Start the Shell Host application**:

```bash
cd shell-host
npm install
npm run dev
```

The Shell Host will run on http://localhost:3000

3. **View the applications**:

- MFE Remote: http://localhost:3001 - View available components and their demos
- Shell Host: http://localhost:3000 - See the integrated micro frontend application

## Available Components

### 1. Counter Component

A simple counter with increment, decrement, and reset functionality.

**Usage:**
```html
<mfe-counter></mfe-counter>
```

**No attributes required.**

### 2. User Profile Component

An editable user profile component with name and email fields.

**Usage:**
```html
<!-- With default values -->
<mfe-user-profile></mfe-user-profile>

<!-- With custom initial values -->
<mfe-user-profile 
  initialName="Jane Doe" 
  initialEmail="jane@example.com">
</mfe-user-profile>
```

**Attributes:**
- `initialName` (optional): Initial name value
- `initialEmail` (optional): Initial email value

## Technical Details

### Web Component Wrapper

The custom web component wrapper (`webComponentWrapper.tsx`) provides:

- **Shadow DOM**: For style encapsulation
- **Attribute Observation**: Watches for attribute changes and re-renders
- **React Integration**: Uses React 19's `createRoot` for rendering
- **Lifecycle Management**: Proper mount/unmount handling
- **Inline Styles**: Critical Tailwind CSS classes inlined for shadow DOM

### MFE Loader Pattern

The Shell Host uses an iframe-based loading strategy:

1. Creates a hidden iframe pointing to the MFE Remote
2. The iframe loads the MFE page, which registers web components globally
3. Once loaded, the shell can use the custom elements
4. The iframe remains hidden but keeps the components registered

### SSR Considerations

- The shell host page HTML is server-rendered
- Web component placeholders are included in the SSR HTML
- On the client, once the MFE loads, components hydrate into the placeholders
- This provides fast initial page load with progressive enhancement

## Development Workflow

### Adding a New Component to MFE Remote

1. Create a React component in `mfe-remote/components/`
2. Register it in `WebComponentRegistration.tsx`:
   ```typescript
   createWebComponent(YourComponent, "mfe-your-component", ["prop1", "prop2"]);
   ```
3. Update the API endpoint in `app/api/components/route.ts`
4. The component is now available for use in the shell host

### Using a Component in Shell Host

```typescript
<WebComponentWrapper 
  tag="mfe-your-component" 
  attributes={{
    prop1: "value1",
    prop2: "value2"
  }}
/>
```

## Building for Production

### MFE Remote

```bash
cd mfe-remote
npm run build
npm start
```

### Shell Host

```bash
cd shell-host
npm run build
npm start
```

## Deployment Considerations

### Production Deployment

1. **Deploy MFE Remote first** to a stable URL (e.g., `https://mfe.example.com`)
2. **Update Shell Host** to point to the production MFE URL:
   ```typescript
   const mfeUrl = process.env.NEXT_PUBLIC_MFE_URL || "https://mfe.example.com";
   ```
3. **Deploy Shell Host** to your hosting platform

### Environment Variables

Create `.env.local` files:

**Shell Host `.env.local`:**
```
NEXT_PUBLIC_MFE_URL=http://localhost:3001
```

For production, set this to your MFE Remote URL.

### CORS Considerations

If deploying to different domains, ensure CORS headers are properly configured on the MFE Remote application.

## Advantages of This Approach

1. **Independent Development**: Teams can work on different MFEs independently
2. **Technology Agnostic**: Web Components can consume any framework
3. **True Isolation**: Shadow DOM provides style and script isolation
4. **SEO Friendly**: Shell is SSR'd, improving SEO and initial load
5. **Progressive Enhancement**: Works even if MFE fails to load
6. **Versioning**: Each MFE can be versioned independently

## Limitations & Trade-offs

1. **Initial Setup Complexity**: More complex than a monolithic app
2. **Network Overhead**: Loading MFE requires an additional request
3. **Shadow DOM Limitations**: Some CSS and events behave differently
4. **Browser Support**: Requires modern browsers with Web Component support
5. **Debugging**: Slightly more complex debugging across boundaries

## Future Enhancements

- [ ] Add module federation for better performance
- [ ] Implement shared state management across MFEs
- [ ] Add error boundaries for MFE failures
- [ ] Implement versioning strategy
- [ ] Add automated tests for web component integration
- [ ] Create a registry service for available components
- [ ] Add authentication/authorization context sharing
- [ ] Implement lazy loading for better performance

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Micro Frontends](https://micro-frontends.org/)

## License

This project is part of the Cosden Solutions code repository and is provided as an educational example.
