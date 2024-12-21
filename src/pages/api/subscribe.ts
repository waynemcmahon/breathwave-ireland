import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let data;
  
  try {
    console.log("request", request);
    // Parse the request body as JSON
    const body = await request.json();
    console.log("Received body:", body);
    
    const email_address = body.email;  // Match the field names from your form
    const first_name = body.firstName; // Match the field names from your form

    const apiKey = import.meta.env.KIT_API_KEY;

    // Step 1: Create subscriber
    const createSubscriberResponse = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({ email_address, first_name }),
    });

    if (!createSubscriberResponse.ok) {
      throw new Error('Failed to create subscriber');
    }

    // Step 2: Add to form
    const addToFormResponse = await fetch(`https://api.kit.com/v4/forms/7462021/subscribers`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({ email_address }),
    });

    if (!addToFormResponse.ok) {
      throw new Error('Failed to add to form');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to process request' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}