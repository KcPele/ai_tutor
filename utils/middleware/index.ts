import { type NextRequest, NextResponse } from "next/server";
import { useAccount } from "wagmi";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const { isConnected } = useAccount();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && !isConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (request.nextUrl.pathname === "/" && isConnected) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
