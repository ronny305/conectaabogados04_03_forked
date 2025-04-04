import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Webhook endpoint to manually trigger revalidation
export async function POST(request: NextRequest) {
  try {
    // Extract slug from request body if provided
    const body = await request.json();
    const { slug } = body;
    
    // Revalidate specific path if slug is provided, otherwise revalidate all
    if (slug) {
      revalidatePath(`/bufete/${slug}`);
    } else {
      // Revalidate the home page and all lawyer profiles
      revalidatePath('/');
      revalidatePath('/bufete/[slug]');
    }
    
    return NextResponse.json({ 
      revalidated: true,
      message: 'Revalidation triggered successfully'
    });
  } catch (error) {
    // If an error occurs, return error response
    return NextResponse.json({ 
      revalidated: false, 
      message: 'Error revalidating',
      error: (error as Error).message
    }, { status: 500 });
  }
}