import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function chatai(bot, msg, match) {
  const chatId = msg.chat.id;
  const question = match[1] || "Tanya apa aja!";

  // Kirim pesan loading
  const loadingMsg = await bot.sendMessage(chatId, "⏳ Memproses AI...");

  try {
    // Request ke AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: question }] }],
    });

    // Ambil text dengan aman
    const result =
      response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ AI tidak merespon, coba lagi nanti.";

    // Escape karakter untuk MarkdownV2
    const escapeMarkdown = (text) =>
      text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");

    const prefix = "AhmAI: ";
    const chunkSize = 3500;

    // Fungsi kirim chunk
    const sendChunks = async (text) => {
      let start = 0;
      while (start < text.length) {
        let chunk = text.slice(start, start + chunkSize);
        start += chunkSize;

        // Deteksi blok kode
        const isCode =
          chunk.includes("\n") &&
          (chunk.includes("{") ||
            chunk.includes("console.") ||
            chunk.includes("function") ||
            chunk.includes("```"));

        if (isCode) {
          await bot.sendMessage(chatId, `\`\`\`js\n${chunk}\n\`\`\``, {
            parse_mode: "Markdown",
          });
        } else {
          await bot.sendMessage(chatId, prefix + escapeMarkdown(chunk), {
            parse_mode: "MarkdownV2",
          });
        }
      }
    };

    await sendChunks(result);

  } catch (err) {
    console.error("ChatAI Error:", err);
    await bot.sendMessage(chatId, "⚠️ AI gagal merespon, coba lagi nanti.");
  } finally {
    // Hapus pesan loading
    await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});
  }
}
