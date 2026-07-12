const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST requests are allowed." });
  }

  const apiKey = process.env.api_key;
  const model = process.env.ai_model || "openai/gpt-oss-120b:free";

  if (!apiKey) {
    return res.status(500).json({ error: "Missing OpenRouter API key." });
  }

  const { message } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Missing message." });
  }

  try {
    const openRouterResponse = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: [
              "你是給小學生使用的生態圈食物鏈 AI 家教。",
              "只回答和這個 web app 情境有關的問題：生態圈、食物鏈、食物網、生產者、消費者、分解者、掠食、被捕食、競爭、共生、能量傳遞，以及畫面中的生物。",
              "使用繁體中文，語氣親切，回答要短、清楚、適合小學生。",
              "可以用 1 到 3 個重點說明，不要太長。",
              "如果使用者提到動物，必須根據使用者訊息中的資料回答牠是原生種、特有種、特有亞種或外來種，並說明牠在食物鏈中的角色與關係。",
              "不要說不知道、不確定、不清楚、可能需要查資料，請根據提供的資料直接回答。",
              "如果資料中沒有完全相同的動物，請用最接近的台灣食物鏈角色回答，仍然要用肯定語氣。",
              "回覆中不要使用任何引號，包含雙引號、單引號、中文引號和書名號。",
              "回覆中不要使用星號、markdown 粗體、項目符號或特殊裝飾符號。",
              "標點盡量只使用逗號和句號。",
              "如果使用者離題，請委婉拒絕，並引導回食物鏈或生態圈主題。"
            ].join("\n")
          },
          {
            role: "user",
            content: message.trim()
          }
        ],
        temperature: 0.4
      })
    });

    const data = await openRouterResponse.json().catch(() => ({}));

    if (!openRouterResponse.ok) {
      return res.status(openRouterResponse.status).json({
        error: data.error?.message || "OpenRouter request failed."
      });
    }

    const reply = data.choices?.[0]?.message?.content
      ?.replace(/["'“”‘’「」『』《》`*#_\[\]<>-]/g, "")
      .replace(/不知道|不確定|不清楚|可能需要查資料/g, "可以從食物鏈資料看出")
      .trim();

    return res.status(200).json({
      reply: reply || "我現在沒有想到合適的回答，可以再問一次和食物鏈有關的問題嗎？"
    });
  } catch (error) {
    return res.status(500).json({
      error: "AI tutor service is temporarily unavailable."
    });
  }
};
