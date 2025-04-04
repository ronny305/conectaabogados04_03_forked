import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

// Function to set up the file watcher for the lawyers directory
export function setupFileWatcher(directory: string) {
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Initialize watcher
  const watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../, // Ignore dot files
    persistent: true
  });

  // Log when watcher is ready
  watcher.on('ready', () => {
    console.log('Initial scan complete. Watching for file changes...');
  });

  // Log when a file is added
  watcher.on('add', filePath => {
    if (path.extname(filePath) === '.json') {
      console.log(`New JSON file detected: ${filePath}`);
      
      // Read and validate the file
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        // Trigger revalidation via API
        triggerRevalidation(data.slug);
      } catch (error) {
        console.error(`Error processing new file ${filePath}:`, error);
      }
    }
  });

  // Log when a file is changed
  watcher.on('change', filePath => {
    if (path.extname(filePath) === '.json') {
      console.log(`JSON file changed: ${filePath}`);
      
      // Read and validate the file
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        
        // Trigger revalidation via API
        triggerRevalidation(data.slug);
      } catch (error) {
        console.error(`Error processing changed file ${filePath}:`, error);
      }
    }
  });

  // Log when a file is deleted
  watcher.on('unlink', filePath => {
    if (path.extname(filePath) === '.json') {
      console.log(`JSON file removed: ${filePath}`);
      
      // Trigger full revalidation since we don't know the slug of the deleted file
      triggerRevalidation();
    }
  });

  return watcher;
}

// Function to trigger revalidation via the API route
async function triggerRevalidation(slug?: string) {
  // In development, we'll use direct API calls to revalidate
  // In production, this would likely be a fetch to the API endpoint
  const body = slug ? { slug } : {};
  
  try {
    // Internal revalidation logic used in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Triggering revalidation${slug ? ` for slug: ${slug}` : ''}`);
      // Import is inside function to prevent server/client mismatch errors
      const { revalidatePath } = await import('next/cache');
      
      if (slug) {
        revalidatePath(`/bufete/${slug}`);
      } else {
        revalidatePath('/');
        revalidatePath('/bufete/[slug]');
      }
    } else {
      // In production, call the API endpoint
      await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    console.log('Revalidation successful');
  } catch (error) {
    console.error('Revalidation failed:', error);
  }
}