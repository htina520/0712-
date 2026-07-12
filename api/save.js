module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST requests are allowed." });
  }

  const gasUrl = process.env.GAS_URL;

  if (!gasUrl) {
    return res.status(500).json({ error: "Missing GAS_URL environment variable." });
  }

  try {
    const gasResponse = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await gasResponse.text();

    if (!gasResponse.ok) {
      return res.status(gasResponse.status).json({
        error: text || "GAS request failed."
      });
    }

    return res.status(200).json({
      result: text
    });
  } catch (error) {
    return res.status(500).json({
      error: error && error.message ? error.message : String(error)
    });
  }
};
