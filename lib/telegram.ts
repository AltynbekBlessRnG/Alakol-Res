type LeadTelegramInput = {
  leadId?: string | null;
  resortTitle?: string | null;
  guestName: string;
  phone: string;
  note?: string | null;
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function notifyLeadToTelegram(input: LeadTelegramInput) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false as const, skipped: true as const };
  }

  const lines = [
    "Новая заявка на Alakol",
    input.resortTitle ? `Объект: ${clean(input.resortTitle)}` : null,
    `Гость: ${clean(input.guestName)}`,
    `Телефон: ${clean(input.phone)}`,
    input.note ? `Комментарий: ${clean(input.note)}` : null,
    input.leadId ? `ID: ${input.leadId}` : null
  ].filter(Boolean);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      console.error("Telegram lead notification failed:", await response.text());
      return { ok: false as const, skipped: false as const };
    }

    return { ok: true as const, skipped: false as const };
  } catch (error) {
    console.error("Telegram lead notification error:", error);
    return { ok: false as const, skipped: false as const };
  }
}

