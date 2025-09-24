import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import express from "express";
dotenv.config({ quiet: true });

import { runjs } from "./commands/runjs.js";
import { runpy } from "./commands/runpy.js";
import ytmp3 from "./commands/ytmp3.js";
import ytmp4 from "./commands/ytmp4.js";
import { start } from "./commands/start.js";
import chatai from "./commands/chatai.js";
import news from "./commands/news.js";
import { tiktok } from "./commands/tiktok.js";

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 Bot started successfully!");

// ===== Setup Express ===== //
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date(),
    bot: {
      polling: bot.isPolling(),
      username: bot.username || 'Unknown',
      connected: bot._polling ? true : false
    },
    memory: process.memoryUsage(),
    version: process.version,
    node_env: process.env.NODE_ENV || 'development'
  };

  if (!bot.isPolling()) {
    healthCheck.status = 'ERROR';
    return res.status(503).json(healthCheck);
  }

  res.json(healthCheck);
});

app.listen(PORT, () => {
  console.log(`🚀 Health check server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// ===== Helper ===== //
const sendMsg = (chatId, text) =>
  bot.sendMessage(chatId, text, { parse_mode: "Markdown" });

const withErrorHandling = (handler) => async (msg, match) => {
  try {
    await handler(bot, msg, match);
  } catch (error) {
    console.error(`Error in ${handler.name}:`, error);
    await bot.sendMessage(msg.chat.id, "⚠️ Terjadi kesalahan. Coba lagi nanti.");
  }
};

// ===== Logging Command ===== //
bot.onText(/^(\/\w+)(?:\s+(.+))?/, (msg, match) => {
  const command = match[1];
  const param = match[2] || "";
  console.log(`[${new Date().toISOString()}] Command: ${command} | Param: ${param} | User: ${msg.from.id}`);
});

// ===== Inline Keyboard ===== //
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  bot.answerCallbackQuery(callbackQuery.id).catch(() => {});
  const me = await bot.getMe().catch(() => ({ first_name: "Bot" }));

  const tips = {
    "/runjs": "Contoh: `/runjs console.log('Hello World')`",
    "/runpy": "Contoh: `/runpy print('Hello World')`",
    "/ytmp3": "Contoh: `/ytmp3 https://youtube.com/watch?v=...`",
    "/ytmp4": "Contoh: `/ytmp4 https://youtube.com/watch?v=...`",
    "/chatai": "Contoh: `/chatai Apa itu AI?`",
    "/news": "Ketik: `/news` untuk berita terkini",
    "/tiktok": "Contoh: `/tiktok https://tiktok.com/...`",
    "/about": `Halo! Ketik /about untuk info lengkap tentang aku 😎`
  };

  sendMsg(chatId, tips[data] || "Fitur belum tersedia.");
});

// ===== Command Text Handlers ===== //
bot.onText(/^\/start$/, async (msg) => {
  try {
    await start(bot, msg);
  } catch (error) {
    console.error("Error in /start:", error);
    await sendMsg(msg.chat.id, "⚠️ Gagal memulai. Coba lagi.");
  }
});

bot.onText(/^\/help$/, (msg) => {
  const helpText = `*Daftar Perintah Bot* 🛠️
Pilih command untuk melihat contoh penggunaannya:`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📝 /runjs", callback_data: "/runjs" }],
      [{ text: "🐍 /runpy", callback_data: "/runpy" }],
      [{ text: "🎵 /ytmp3", callback_data: "/ytmp3" }],
      [{ text: "🎬 /ytmp4", callback_data: "/ytmp4" }],
      [{ text: "🤖 /chatai", callback_data: "/chatai" }],
      [{ text: "📰 /news", callback_data: "/news" }],
      [{ text: "🎵 /tiktok", callback_data: "/tiktok" }],
      [{ text: "ℹ️ /about", callback_data: "/about" }]
    ]
  };

  sendMsg(msg.chat.id, helpText);
  bot.sendMessage(msg.chat.id, "Klik tombol di bawah untuk contoh penggunaan:", { reply_markup: keyboard });
});

bot.onText(/^\/halo$/, (msg) => {
  sendMsg(msg.chat.id, "Halo sayang!! 😘 Semangat terus ya hari ini!");
});

// ===== Updated /about ===== //
bot.onText(/^\/about$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const me = await bot.getMe();

    const aboutText = `
👋 Halo *${msg.from.first_name || "teman"}*!

Aku adalah *${me.first_name}* 🤖, bot serbaguna karya *AhzamyCode* yang siap nemenin kamu menjelajah berbagai fitur dan tools keren di Telegram! 🚀

----------------------------------------
✨ *Tentang Bot*:
- Dibuat dengan ❤️ oleh *AhzamyCode*
- Versi: *1.1.0*
- Dibangun untuk mempermudah developer & pengguna Telegram
- Terus diupdate dengan fitur baru setiap minggu
- Stabil dan ringan dijalankan di Node.js 18+
----------------------------------------
📌 *Fitur Unggulan*:
1️⃣ Jalankan kode JavaScript → /runjs  
2️⃣ Jalankan script Python → /runpy  
3️⃣ Download YouTube → /ytmp3 | /ytmp4  
4️⃣ Chat dengan AI cerdas → /chatai  
5️⃣ Berita terkini → /news  
6️⃣ Download TikTok tanpa watermark → /tiktok <url>  
7️⃣ Banyak fitur rahasia lainnya yang menunggu untuk ditemukan! 😉

----------------------------------------
💡 *Tips & Trik*:
- Gunakan /help untuk melihat semua perintah
- Eksperimen dengan /runjs & /runpy untuk belajar sambil bermain
- Nikmati setiap fitur dan eksplorasi bot ini sesuka hati

----------------------------------------
👤 *Creator*: AhzamyCode 🚀  
📅 *Tanggal*: ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}  

Terima kasih sudah menggunakan *${me.first_name}*! Semoga harimu menyenangkan dan produktif 😎
`;

    await sendMsg(chatId, aboutText);
  } catch (error) {
    console.error("Error in /about:", error);
    await sendMsg(chatId, "⚠️ Gagal mengambil info bot.");
  }
});

// ===== Forward ke Command Handlers ===== //
bot.onText(/^\/runjs (.+)/, withErrorHandling(runjs));
bot.onText(/^\/runpy (.+)/, withErrorHandling(runpy));
bot.onText(/^\/ytmp3 (.+)/, withErrorHandling(ytmp3));
bot.onText(/^\/ytmp4 (.+)/, withErrorHandling(ytmp4));
bot.onText(/^\/chatai (.+)/, withErrorHandling(chatai));
bot.onText(/^\/news$/, withErrorHandling(news));
bot.onText(/^\/tiktok (.+)/, withErrorHandling(tiktok));

export default bot;
