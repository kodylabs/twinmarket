import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

const PUBLIC_ROUTES = [
  {
    path: '/',
    dynamic: false,
  },
  {
    path: '/twins',
    dynamic: true,
  },
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => (route.dynamic ? pathname.startsWith(route.path) : pathname === route.path));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|manifest.webmanifest|_next/image|.*\\.png$).*)'],
};
