import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * UTF-8 Encoding Correction Patterns.
 * Handles double-encoded UTF-8 characters from backend (MySQL/JDBC misconfiguration).
 *
 * Pattern: ÃÂ³ -> ó (double-encoded), Ã³ -> ó (single-encoded)
 */
const ENCODING_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  // Double-encoded patterns (ÃÂ -> single char)
  [/ÃÂ³/g, 'ó'],
  [/ÃÂ±/g, 'ñ'],
  [/ÃÂ¡/g, 'á'],
  [/ÃÂ©/g, 'é'],
  [/ÃÂº/g, 'ú'],
  [/ÃÂ­/g, 'í'],
  [/ÃÂ¼/g, 'ü'],
  [/ÃÂ'/g, 'Ñ'],
  [/ÃÂ"/g, 'Ó'],
  [/ÃÂ/g, 'Á'],
  [/ÃÂ‰/g, 'É'],
  [/ÃÂš/g, 'Ú'],
  [/ÃÂ/g, 'Í'],
  [/ÃÂœ/g, 'Ü'],

  // Single-encoded patterns (Ã -> single char)
  [/Ã³/g, 'ó'],
  [/Ã±/g, 'ñ'],
  [/Ã¡/g, 'á'],
  [/Ã©/g, 'é'],
  [/Ãº/g, 'ú'],
  [/Ã­/g, 'í'],
  [/Ã¼/g, 'ü'],
  [/Ã'/g, 'Ñ'],
  [/Ã"/g, 'Ó'],
  [/Ã/g, 'Á'],
  [/Ã‰/g, 'É'],
  [/Ãš/g, 'Ú'],
  [/Ã/g, 'Í'],
  [/Ãœ/g, 'Ü'],

  // Additional common patterns
  [/Â€/g, '€'],
  [/â‚¬/g, '€'],
  [/Ã¢â‚¬/g, '€']
] as const;

/**
 * Recursively fix encoding issues in any value (string, object, array).
 */
function fixEncodingRecursive(value: unknown): unknown {
  if (typeof value === 'string') {
    return fixEncodingString(value);
  }

  if (Array.isArray(value)) {
    return value.map(item => fixEncodingRecursive(item));
  }

  if (value !== null && typeof value === 'object') {
    const fixed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      fixed[key] = fixEncodingRecursive(val);
    }
    return fixed;
  }

  return value;
}

/**
 * Fix encoding in a single string.
 */
function fixEncodingString(text: string): string {
  if (!text) return text;

  let result = text;
  for (const [pattern, replacement] of ENCODING_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Check if response content-type is JSON.
 */
function isJsonResponse(response: HttpResponse<unknown>): boolean {
  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

/**
 * HTTP Interceptor that fixes UTF-8 encoding issues in API responses.
 *
 * Intercepts all HTTP responses and recursively fixes double-encoded
 * UTF-8 characters (common issue with MySQL/JDBC misconfiguration).
 *
 * This is a transparent, global solution that eliminates the need for
 * manual encoding fixes in individual services.
 *
 * @example
 * // Before: "Descripción" becomes "DescripciÃ³n" from backend
 * // After: Automatically corrected to "Descripción"
 */
export const encodingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      // Only process HttpResponse events with JSON content
      if (event instanceof HttpResponse && isJsonResponse(event)) {
        const fixedBody = fixEncodingRecursive(event.body);
        return event.clone({ body: fixedBody });
      }
      return event;
    })
  );
};
