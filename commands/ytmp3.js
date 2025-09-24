import ytdl from "@distube/ytdl-core";
import fs from "fs";

export default async function ytmp3(bot, msg, match) {
  const chatId = msg.chat.id;
  const url = match[1];

  const loadingMsg = await bot.sendMessage(chatId, "⏳ Sedang memproses, tunggu sebentar...");

  if (!ytdl.validateURL(url)) {
    await bot.editMessageText("❌ URL YouTube tidak valid.", { chat_id: chatId, message_id: loadingMsg.message_id });
    return;
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails.pop().url;
    const duration = info.videoDetails.lengthSeconds;

    await bot.sendPhoto(chatId, thumbnail, {
      caption: `🎶 *${title}*\n⏱️ Durasi: ${duration} detik`,
      parse_mode: "Markdown",
    });

    const filePath = `./tmp_${Date.now()}.mp3`;
    const writeStream = fs.createWriteStream(filePath);

    ytdl(url, { filter: "audioonly", quality: "highestaudio" })
      .pipe(writeStream)
      .on("finish", async () => {
        await bot.sendAudio(chatId, filePath, {
          title,
          performer: "YouTube",
          filename: `${title}.mp3`,
        });

        fs.unlinkSync(filePath);
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      })
      .on("error", async (err) => {
        console.error("YTMP3 Stream Error:", err);
        await bot.editMessageText("⚠️ Gagal download audio.", { chat_id: chatId, message_id: loadingMsg.message_id });
      });

  } catch (err) {
    console.error("YTMP3 Error:", err);
    await bot.editMessageText("⚠️ Gagal download audio.", { chat_id: chatId, message_id: loadingMsg.message_id });
  }
}
