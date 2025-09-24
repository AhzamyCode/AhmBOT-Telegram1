// commands/news.js
import axios from "axios";

export default async function news(bot, msg) {
  const chatId = msg.chat.id;

  try {
    // Ambil data berita dari API Kompas
    const { data } = await axios.get("https://api-furina.vercel.app/berita/kompas");

    if (!data?.status || !data.result?.length) {
      await bot.sendMessage(chatId, "❌ Berita tidak ditemukan.", {
        reply_to_message_id: msg.message_id,
      });
      return;
    }

    // Format berita
    let teks = "📰 *Berita Terkini (Kompas)*\n\n";
    data.result.slice(0, 5).forEach((v, i) => {
      teks += `*${i + 1}. ${v.title}*\n`;
      teks += `📅 ${v.published_at}\n`;
      teks += `[Baca selengkapnya](${v.url})\n\n`;
    });

    // Kirim berita
    await bot.sendMessage(chatId, teks.trim(), {
      parse_mode: "Markdown",
      reply_to_message_id: msg.message_id,
      disable_web_page_preview: false, // biar link ada preview
    });
  } catch (err) {
    console.error("Gagal mengambil data berita:", err.message);
    await bot.sendMessage(chatId, "⚠️ Gagal mengambil data berita.", {
      reply_to_message_id: msg.message_id,
    });
  }
}
