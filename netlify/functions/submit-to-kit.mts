import type { Context } from "@netlify/functions"

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    })
  }

  const apiKey = process.env.KIT_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    // Parse the request body
    const body = await req.json()
    console.log("Received request body:", body) // Debug log
    
    const { email, firstName } = body

    if (!email) {
      console.log("Email missing from request") // Debug log
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    console.log("Creating/updating subscriber with email:", email) // Debug log
    console.log("API Key being used:", apiKey) // Debug the actual API key value
    
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Kit-Api-Key": "kit_47e1247245ac16b029fb7ce9f25d28d2"
    }
    console.log("Request headers:", headers) // Debug the headers

    const subscriberResponse = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email_address: email,
        first_name: firstName
      })
    })

    // Log the full response for debugging
    console.log("Response status:", subscriberResponse.status)
    console.log("Response headers:", Object.fromEntries(subscriberResponse.headers))
    
    if (!subscriberResponse.ok) {
      const errorData = await subscriberResponse.json()
      console.log("Error response body:", errorData) // Debug the error response
      throw new Error(`ConvertKit API error: ${errorData.message || subscriberResponse.statusText}`)
    }

    const subscriberData = await subscriberResponse.json()

    // Then add them to the form
    const formResponse = await fetch(`https://api.kit.com/v4/forms/7462021/subscribers/${subscriberData.subscriber.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Kit-Api-Key": "kit_47e1247245ac16b029fb7ce9f25d28d2"
      }
    })

    if (!formResponse.ok) {
      const errorData = await formResponse.json()
      throw new Error(`ConvertKit API error: ${errorData.message || formResponse.statusText}`)
    }

    const data = await formResponse.json()

    return new Response(JSON.stringify({ 
      message: "Subscription successful",
      data 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error('ConvertKit API Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
