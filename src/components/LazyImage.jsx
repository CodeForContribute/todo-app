import { useState, useRef, useEffect } from 'react';

/**
 * LazyImage - Optimized image component with lazy loading
 *
 * Features:
 * - Native lazy loading with Intersection Observer fallback
 * - Blur-up placeholder effect
 * - Error handling with fallback
 * - Responsive srcset support
 * - WebP format detection
 */

// Check for WebP support
let webpSupported = null;
async function checkWebPSupport() {
  if (webpSupported !== null) return webpSupported;

  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      webpSupported = img.width > 0 && img.height > 0;
      resolve(webpSupported);
    };
    img.onerror = () => {
      webpSupported = false;
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

// Initialize WebP check
checkWebPSupport();

/**
 * Generate a tiny placeholder SVG
 */
function generatePlaceholder(width, height, color = '#e2e8f0') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

/**
 * LazyImage Component
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderColor = '#e2e8f0',
  fallbackSrc,
  srcSet,
  sizes,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Use Intersection Observer for browsers that don't support native lazy loading
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Check if native lazy loading is supported
    if ('loading' in HTMLImageElement.prototype) {
      setIsInView(true);
      return;
    }

    // Fallback to Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Determine the actual source to use
  const actualSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const placeholder = generatePlaceholder(width || 100, height || 100, placeholderColor);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? actualSrc : placeholder}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        {...props}
      />
    </div>
  );
}

/**
 * Avatar with lazy loading
 */
export function LazyAvatar({
  src,
  alt,
  size = 40,
  fallback,
  className = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  // Generate initials from alt text
  const initials = alt
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  if (!src || hasError) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-full
          bg-gradient-to-br from-violet-500 to-purple-600
          text-white font-medium
          ${className}
        `}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
        }}
        role="img"
        aria-label={alt}
      >
        {fallback || initials}
      </div>
    );
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

/**
 * Background image with lazy loading
 */
export function LazyBackground({
  src,
  children,
  className = '',
  placeholderColor = '#e2e8f0',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Preload image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [isInView, src]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        backgroundColor: placeholderColor,
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.3s ease',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default LazyImage;
