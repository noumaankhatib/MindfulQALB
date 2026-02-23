import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

/**
 * Catches route errors and shows a friendly message instead of "Unexpected Application Error".
 */
export function AppErrorBoundary() {
  const error = useRouteError();

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const message = is404
    ? 'The page you’re looking for doesn’t exist.'
    : (error instanceof Error ? error.message : 'Something went wrong');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-display font-semibold text-gray-800 mb-2">
          {is404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl font-medium text-white bg-lavender-600 hover:bg-lavender-700 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

/** Shown for unknown URLs (404). */
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-display font-semibold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl font-medium text-white bg-lavender-600 hover:bg-lavender-700 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
