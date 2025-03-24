import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el token de las cookies o del localStorage (a través de una cookie especial)
  const token = request.cookies.get('authToken')?.value || '';
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Rutas de administrador que requieren rol de admin
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Verificar si la ruta requiere autenticación
  if (isProtectedRoute) {
    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Para rutas de admin, verificar el rol (esto requeriría decodificar el JWT)
    // Esta es una implementación simplificada, idealmente deberías verificar el token
    if (isAdminRoute) {
      try {
        // Aquí podrías decodificar el JWT para verificar el rol
        // Por ahora, asumimos que el token es válido
      } catch (error) {
        // Si hay un error o el usuario no es admin, redirigir al dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
