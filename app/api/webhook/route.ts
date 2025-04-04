import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Extract lawyer firm data from request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.slug || !data.nombre_estudio) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: slug and nombre_estudio are required' 
      }, { status: 400 });
    }
    
    // Ensure the directory exists
    const directory = path.join(process.cwd(), 'data/lawyers');
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Create file path
    const filePath = path.join(directory, `${data.slug}.json`);
    
    // Write data to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/bufete/${data.slug}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Lawyer firm data saved successfully',
      slug: data.slug
    });
  } catch (error) {
    console.error('Error saving lawyer firm data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error saving lawyer firm data',
      error: (error as Error).message 
    }, { status: 500 });
  }
}