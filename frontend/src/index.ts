import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";

const fastify = Fastify();

// Define the port, matching what's exposed in the Dockerfile
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Register fastify-static to serve your Vite build
// The Dockerfile copies the Vite 'dist' folder into './public'
// within the container's /app directory.
// process.cwd() will be /app when the container runs,
// so path.join(process.cwd(), "public") correctly points to /app/public.
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), "public"),
  // Set `index` to false and handle `index.html` with setNotFoundHandler for SPAs
  index: false,
  // Ensure we can serve files relative to the root when needed
  // This is where fastify will look for files requested without a specific path, e.g., /index.html
  serveDotFiles: true, // Allow serving files that start with a dot (like .htaccess, though not relevant here)
  prefix: "/", // Serve from the root path
});

// Explicitly serve index.html for the root path ("/")
// This ensures that when the browser requests '/', the main HTML file is sent.
fastify.get("/", (request, reply) => {
  reply.sendFile("index.html");
});

// For any other route not found (e.g., direct access to /about in an SPA),
// serve the index.html of your frontend application.
// This is crucial for single-page applications (SPAs) with client-side routing.
fastify.setNotFoundHandler((request, reply) => {
  reply.sendFile("index.html");
});

// Start the server on the specified port and listen on all network interfaces
fastify
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(
      `Serving static files from: ${path.join(process.cwd(), "public")}`
    );
  })
  .catch((err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1); // Exit with an error code if server fails to start
  });
