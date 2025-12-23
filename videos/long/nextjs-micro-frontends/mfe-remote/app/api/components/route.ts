import { NextResponse } from "next/server";

export async function GET() {
  // Return information about available components
  const components = [
    {
      name: "mfe-counter",
      description: "A counter component with increment, decrement, and reset functionality",
      attributes: [],
      example: "<mfe-counter></mfe-counter>",
    },
    {
      name: "mfe-user-profile",
      description: "A user profile component with editable name and email",
      attributes: [
        {
          name: "initialName",
          type: "string",
          default: "John Doe",
        },
        {
          name: "initialEmail",
          type: "string",
          default: "john.doe@example.com",
        },
      ],
      example: '<mfe-user-profile initialName="Jane Doe" initialEmail="jane@example.com"></mfe-user-profile>',
    },
  ];

  return NextResponse.json({
    components,
    usage: {
      steps: [
        "1. Include the MFE script in your HTML: Load this page in an iframe or import the registration script",
        "2. Wait for the web components to be registered",
        "3. Use the custom elements in your HTML",
        "4. The components will automatically hydrate on the client side",
      ],
      scriptUrl: "/mfe-components.js",
    },
  });
}
