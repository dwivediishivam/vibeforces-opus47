import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://vibeforces-api.onrender.com/api/v1";

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<unknown> },
) {
  const { path = [] } = (await context.params) as { path?: string[] };
  const upstreamUrl = new URL(`${UPSTREAM_API_BASE}/${path.join("/")}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("origin");
  headers.delete("referer");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(upstreamUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";

export { proxyRequest as GET };
export { proxyRequest as POST };
export { proxyRequest as PUT };
export { proxyRequest as PATCH };
export { proxyRequest as DELETE };
export { proxyRequest as OPTIONS };
