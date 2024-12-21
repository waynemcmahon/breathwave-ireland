exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { email } = JSON.parse(event.body);

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email is required" }),
    };
  }

  try {
    const response = await fetch("https://api.convertkit.com/v3/forms/7462021/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        api_key: process.env.KIT_API_KEY,
      }),
    });

    if (!response.ok) {
      throw new Error(`ConvertKit API error: ${response.statusText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Subscription successful" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
