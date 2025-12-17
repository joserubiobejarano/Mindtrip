import { z, ZodSchema, ZodError } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates request body, query params, or route params with a Zod schema.
 * Strips unknown fields and returns typed data.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate (body, query, or params)
 * @returns Typed and validated data
 * @throws ZodError if validation fails
 */
export function validateData<T extends ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Safely validates request data, returning error response if validation fails.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either data or error response
 */
export function safeValidate<T extends ZodSchema>(
  schema: T,
  data: unknown
): 
  | { success: true; data: z.infer<T> }
  | { success: false; error: NextResponse } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validates request body from JSON.
 * Returns validated data or throws error response.
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema for body validation
 * @returns Validated body data
 * @throws NextResponse if validation fails (should be returned from route handler)
 */
export async function validateBody<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    if (error instanceof NextResponse) {
      throw error;
    }
    throw NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
}

/**
 * Validates query parameters from request URL.
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema for query validation
 * @returns Validated query data
 * @throws NextResponse if validation fails
 */
export function validateQuery<T extends ZodSchema>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    const query: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    
    return schema.parse(query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    throw NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 }
    );
  }
}

/**
 * Validates route parameters (from dynamic routes).
 * 
 * @param params - Route params object (may be Promise in Next.js 15)
 * @param schema - Zod schema for params validation
 * @returns Validated params data
 * @throws NextResponse if validation fails
 */
export async function validateParams<T extends ZodSchema>(
  params: unknown,
  schema: T
): Promise<z.infer<T>> {
  try {
    // Handle Next.js 15 async params
    const resolvedParams = params instanceof Promise ? await params : params;
    return schema.parse(resolvedParams);
  } catch (error) {
    if (error instanceof ZodError) {
      throw NextResponse.json(
        {
          error: 'Invalid route parameters',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    throw NextResponse.json(
      { error: 'Invalid route parameters' },
      { status: 400 }
    );
  }
}
