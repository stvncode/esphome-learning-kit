import type { HealthResponse } from "@esphome-learning-kit/types";

const server = Bun.serve({
  port: 3001,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/health") {
      const body: HealthResponse = { status: "ok" };
      return Response.json(body);
    }
    return new Response("backend", { status: 200 });
  },
});

console.log(`backend listening on http://localhost:${server.port}`);
