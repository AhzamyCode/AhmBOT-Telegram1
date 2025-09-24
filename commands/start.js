// commands/start.js
export async function start(bot, msg) {
  const chatId = msg.chat.id;
  const me = await bot.getMe().catch(() => ({ first_name: "Bot" }));

  const createdBy = "AhzamyCode"; 
  const botVersion = "1.1.0"; // update versi biar keliatan ada fitur baru
  const now = new Date();
  const date = now.toLocaleDateString("id-ID", { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });

  const text = `👋 Halo *${msg.from.first_name || "teman"}*!  
Selamat datang di *${me.first_name}* 🤖

📅 Tanggal: ${date}  
👤 Creator: ${createdBy}  
📌 Versi bot: ${botVersion}

Pilih menu di bawah untuk mulai eksplorasi fitur:`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💻 Jalankan JS", callback_data: "/runjs" }],
        [{ text: "🐍 Jalankan PY", callback_data: "/runpy" }],
        [{ text: "🎵 YouTube MP3", callback_data: "/ytmp3" }],
        [{ text: "🎥 YouTube MP4", callback_data: "/ytmp4" }],
        [{ text: "🤖 Chat AI", callback_data: "/chatai" }],
        [{ text: "📰 News", callback_data: "/news" }],
        [{ text: "▶️ TikTok Downloader", callback_data: "/tiktok" }],
        [{ text: "ℹ️ About", callback_data: "/about" }]
      ]
    },
    parse_mode: "Markdown"
  };

  try {
    // kirim loading dulu
    const loadingMsg = await bot.sendMessage(chatId, "⏳ Sedang menyiapkan bot untukmu...");
    
    // kirim foto profil + caption menu
    await bot.sendPhoto(chatId, "./media/kevyll_profile.jpg", {
      caption: text,
      parse_mode: "Markdown",
      reply_markup: keyboard.reply_markup
    });

    // hapus loading
    await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

  } catch (err) {
    console.error("Start Command Error:", err);
    // fallback kalau gagal kirim foto
    await bot.sendMessage(chatId, text, keyboard).catch(() => {});
  }
}
