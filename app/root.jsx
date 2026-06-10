import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  Link,
} from "@remix-run/react";

// 1. Import stylesheet sebagai URL
import stylesheet from "./style.css?url";

// 2. Definisikan fungsi links (Cara standar Remix)
export const links = () => [
  { rel: "stylesheet", href: stylesheet },
];

function Document({ children, title }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        {/* Links akan memanggil fungsi links() di atas */}
        <Links />
        <script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-fHhqdeUTRL3pBnNF"
        ></script>
      </head>
      <body className="bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Document title="404 Not Found">
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
            {/* UI 404 Anda */}
            <h1 className="text-8xl font-extrabold">404</h1>
            <p className="mt-4 text-gray-500">Halaman tidak ditemukan.</p>
            <div className="mt-8">
              <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg">
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </Document>
    );
  }

  return (
    <Document title="Error!">
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h1>
        <p>{error instanceof Error ? error.message : "Unknown Error"}</p>
      </div>
    </Document>
  );
}