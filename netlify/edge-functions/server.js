import handler from "../../dist/server/index.js";

export default async function (request) {
  const { pathname } = new URL(request.url);
  // Let Netlify CDN serve static client assets directly from dist/client/
  if (pathname.startsWith("/assets/")) {
    return;
  }
  return handler.fetch(request, {}, {});
}

export const config = { path: "/*" };
