const fs = require('fs');
const path = require('path');

// Handler for Netlify function
exports.handler = async function(event, context) {
  // Set CORS headers to allow requests from any origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed. Only POST requests are accepted.' 
      })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.slug || !data.nombre_estudio) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: slug and nombre_estudio are required' 
        })
      };
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
    
    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Lawyer firm data saved successfully',
        slug: data.slug
      })
    };
  } catch (error) {
    console.error('Error saving lawyer firm data:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Error saving lawyer firm data',
        error: error.message 
      })
    };
  }
};