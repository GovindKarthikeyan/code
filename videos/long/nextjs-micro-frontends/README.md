# Next.js Micro Frontends with Web Components

This project demonstrates a modern micro frontend architecture using Next.js and Web Components. It consists of two Next.js applications:

1. **MFE Remote** (Port 3001): Exposes React components as Web Components
2. **Shell Host** (Port 3000): Consumes and integrates the micro frontend components

## Screenshots

### MFE Remote - Component Library
![MFE Remote](https://github.com/user-attachments/assets/cc88e6e2-dbeb-4986-8df2-d6fa21e5d5d2)

### Shell Host - Container Application  
![Shell Host](https://github.com/user-attachments/assets/e435dabe-7b9e-4b2b-9ec7-9cd96144fc4a)

## Architecture Overview

### Key Features

- ✅ **Server-Side Rendering (SSR)**: The shell host page is server-side rendered by Next.js
- ✅ **Web Components**: MFE components are wrapped as custom HTML elements  
- ✅ **Client-Side Hydration**: Web components hydrate React components on the client
- ✅ **Style Isolation**: Shadow DOM ensures CSS encapsulation
- ✅ **Independent Development**: Each MFE can be developed and deployed separately
- ✅ **CORS Support**: Configured for cross-origin resource sharing

### How It Works

1. **MFE Remote Application**:
   - Defines React components (`Counter`, `UserProfile`)
   - Wraps them as Web Components using a custom wrapper
   - Registers them as custom elements (`<mfe-counter>`, `<mfe-user-profile>`)
   - Exposes an API endpoint for component metadata
   - Serves content with CORS headers enabled

2. **Shell Host Application**:
   - Server-side renders the main shell layout
   - Loads the MFE Remote page in a hidden iframe
   - The iframe triggers web component registration
   - Uses the web components in its pages
   - Web components hydrate on the client side

3. **SSR + Hydration Flow**:
   ```
   Server (Shell Host) → Renders HTML shell
                      ↓
   Client (Browser)   → Loads MFE iframe → Registers web components (in iframe context)
                      ↓
   Client (Browser)   → Web component placeholders → Ready for use
   ```

### Cross-Origin Considerations

**Important Note**: Due to browser security restrictions, web components registered in an iframe at a different origin (different port/domain) cannot be directly accessed by the parent window. This is a fundamental browser security feature.

**Production Solutions**:
1. **Same-Origin Deployment**: Deploy both apps behind a reverse proxy (e.g., nginx) so they share the same origin
2. **Module Federation**: Use Webpack Module Federation for build-time/runtime integration
3. **Script Loading**: Export web components as standalone scripts that can be loaded via `<script>` tags
4. **Monorepo with Shared Packages**: Share component code directly between applications

**Current Demo**: This implementation demonstrates the architecture. For full functionality in production:
- Use a reverse proxy (nginx, traefik) to serve both apps from the same origin
- Deploy MFE at `/mfe/*` and Shell at `/*` on the same domain
- Or use Module Federation for seamless integration

## Project Structure

```
nextjs-micro-frontends/
├── mfe-remote/                 # Micro Frontend Remote App (Port 3001)
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
│   ├── scripts/
│   │   └── register-components.ts   # Script for external loading
│   └── next.config.ts         # CORS headers configured
│
└── shell-host/                # Shell Host App (Port 3000)
    ├── app/
    │   ├── layout.tsx
    │   └── page.tsx           # Main page consuming MFE components
    ├── components/
    │   ├── MFELoader.tsx      # Loads MFE and manages registration
    │   └── WebComponentWrapper.tsx  # Wrapper for web components
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation & Running

**Important**: Both applications must be running for the demo to work.

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

- **MFE Remote**: http://localhost:3001 - View available components and their demos
- **Shell Host**: http://localhost:3000 - See the shell application (demonstrates architecture)

### For Production Deployment

To make this fully functional in production, use one of these approaches:

**Option 1: Nginx Reverse Proxy (Recommended)**

```nginx
server {
    listen 80;
    server_name example.com;

    # Shell Host
    location / {
        proxy_pass http://shell-host:3000;
    }

    # MFE Remote
    location /mfe/ {
        proxy_pass http://mfe-remote:3001/;
    }
}
```

Then update the shell host to load from `/mfe` instead of `http://localhost:3001`.

**Option 2: Same-Origin Deployment**

Deploy both apps to subdomains of the same domain with appropriate CORS policies.

## Available Components

### 1. Counter Component

A simple counter with increment, decrement, and reset functionality.

**Usage:**
```html
<mfe-counter></mfe-counter>
```

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
- **Target Window Support**: Can register in different window contexts

### MFE Loader Pattern

The Shell Host uses an iframe-based loading strategy:

1. Creates a hidden iframe pointing to the MFE Remote
2. The iframe loads the MFE page, which registers web components
3. Polls to check if components are registered
4. Shows success/error status

**Limitation**: Due to cross-origin restrictions (different ports), components registered in the iframe are not accessible in the parent window. This works in production when served from the same origin.

### SSR Considerations

- The shell host page HTML is server-rendered
- Web component placeholders are included in the SSR HTML
- On the client, web components are registered and can be used
- This provides fast initial page load with progressive enhancement

## Development Workflow

### Adding a New Component to MFE Remote

1. Create a React component in `mfe-remote/components/`
2. Register it in `WebComponentRegistration.tsx`:
   ```typescript
   createWebComponent(YourComponent, "mfe-your-component", ["prop1", "prop2"]);
   ```
3. Update the API endpoint in `app/api/components/route.ts`
4. The component is now available as `<mfe-your-component>`

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

## Deployment Examples

### Docker Compose with Nginx

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - shell-host
      - mfe-remote

  shell-host:
    build: ./shell-host
    expose:
      - "3000"

  mfe-remote:
    build: ./mfe-remote
    expose:
      - "3001"
```

### Kubernetes

Deploy both apps as separate services and use an Ingress controller to route:
- `/` → Shell Host service
- `/mfe/*` → MFE Remote service

## Environment Variables

Create `.env.local` files:

**Shell Host `.env.local`:**
```
NEXT_PUBLIC_MFE_URL=http://localhost:3001
```

For production, set this to your MFE Remote URL or path.

## Advantages of This Approach

1. **Independent Development**: Teams can work on different MFEs independently
2. **Technology Agnostic**: Web Components can be consumed by any framework
3. **True Isolation**: Shadow DOM provides style and script isolation
4. **SEO Friendly**: Shell is SSR'd, improving SEO and initial load
5. **Progressive Enhancement**: Shell works even if MFE fails to load
6. **Versioning**: Each MFE can be versioned independently
7. **Modern Stack**: Uses latest Next.js 16 and React 19

## Limitations & Trade-offs

1. **Cross-Origin Complexity**: Requires same-origin or proper setup in production
2. **Initial Setup**: More complex than a monolithic app
3. **Network Overhead**: Loading MFE requires additional requests
4. **Shadow DOM Limitations**: Some CSS and events behave differently
5. **Browser Support**: Requires modern browsers with Web Component support
6. **Debugging**: Slightly more complex debugging across boundaries

## Alternative Approaches

If this iframe approach doesn't fit your needs, consider:

1. **Module Federation**: Webpack 5's Module Federation for seamless runtime sharing
2. **Single-SPA**: Framework for building micro frontend applications
3. **Script Tag Loading**: Export components as UMD bundles loaded via script tags
4. **Monorepo with Shared Packages**: Use Nx or Turborepo with shared component libraries

## Troubleshooting

### Web components not showing in Shell Host

**Cause**: Cross-origin restrictions prevent iframe's components from being accessible in parent window.

**Solution**: 
- For development: This is expected due to different ports (architectural demo)
- For production: Deploy both apps behind a reverse proxy on the same origin

### CORS Errors

**Cause**: Browser blocking cross-origin requests.

**Solution**:
- CORS headers are configured in `mfe-remote/next.config.ts`
- For production, ensure your reverse proxy or CDN passes through CORS headers

### Components not rendering

**Cause**: MFE Remote not loaded or web components not registered.

**Solution**:
- Check that http://localhost:3001 is accessible
- Check browser console for errors
- Verify both applications are running

## Future Enhancements

- [ ] Add module federation for better integration
- [ ] Implement shared state management across MFEs
- [ ] Add error boundaries for MFE failures
- [ ] Implement versioning strategy
- [ ] Add automated tests for web component integration
- [ ] Create a registry service for available components
- [ ] Add authentication/authorization context sharing
- [ ] Implement lazy loading for better performance
- [ ] Add performance monitoring
- [ ] Create CLI tool for generating new MFEs

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Micro Frontends](https://micro-frontends.org/)
- [Module Federation](https://webpack.js.org/concepts/module-federation/)

## License

This project is part of the Cosden Solutions code repository and is provided as an educational example.

---

**Note**: This implementation demonstrates the micro frontend architecture concept. The MFE Remote shows fully functional components. For the Shell Host to fully consume these components in a working application, deploy both behind a reverse proxy or implement Module Federation for production use.
