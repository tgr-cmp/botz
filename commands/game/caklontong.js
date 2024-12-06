const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

const session = new Map();

module.exports = {
    name: "caklontong",
    category: "game",
    handler: {},
    code: async (ctx) => {
        const status = await handler(ctx, module.exports.handler);
        if (status) return;

        if (session.has(ctx.id)) return await ctx.reply(quote(`🎮 Sesi permainan sedang berjalan!`));

        try {
            const apiUrl = tools.api.createUrl("siputzx", "/api/games/caklontong");
            const {
                data
            } = (await axios.get(apiUrl)).data;

            const game = {
                coin: 5,
                timeout = 60000,
                senderNumber = ctx.sender.jid.split(/[:@]/)[0],
                answer: data.jawaban.toUpperCase()
            };

            session.set(ctx.id, true);

            await ctx.reply(
                `${quote(`Soal: ${data.soal}`)}\n` +
                `${quote(`Bonus: ${game.coin} Koin`)}\n` +
                `${quote(`Batas waktu: ${game.timeout / 1000} detik`)}\n` +
                `${quote("Ketik 'hint' untuk bantuan.")}\n` +
                `${quote("Ketik 'surrender' untuk menyerah.")}\n` +
                "\n" +
                config.msg.footer
            );

            const collector = ctx.MessageCollector({
                time: game.timeout
            });

            collector.on("collect", async (m) => {
                const userAnswer = m.content.toUpperCase();

                if (userAnswer === game.answer) {
                    session.delete(ctx.id);
                    await Promise.all([
                        await db.add(`user.${game.senderNumber}.game.coin`, game.coin),
                        await db.add(`user.${game.senderNumber}.winGame`, 1)
                    ]);
                    await ctx.sendMessage(
                        ctx.id, {
                            text: `${quote("💯 Benar!")}\n` +
                                `${quote(data.deskripsi)}\n` +
                                quote(`+${game.coin} Koin`)
                        }, {
                            quoted: m
                        }
                    );
                    return collector.stop();
                } else if (userAnswer === "HINT") {
                    const clue = game.answer.replace(/[AIUEOaiueo]/g, "_");
                    await ctx.sendMessage(ctx.id, {
                        text: monospace(clue)
                    }, {
                        quoted: m
                    });
                } else if (userAnswer === "SURRENDER") {
                    session.delete(ctx.id);
                    await ctx.reply(
                        `${quote("🏳️ Anda menyerah!")}\n` +
                        quote(`Jawabannya adalah ${game.answer}.`)
                    );
                    return collector.stop();
                }
            });

            collector.on("end", async () => {
                const description = data.deskripsi;

                if (session.has(ctx.id)) {
                    session.delete(ctx.id);
                    return await ctx.reply(
                        `${quote("⏱ Waktu habis!")}\n` +
                        `${quote(`Jawabannya adalah ${game.answer}.`)}\n` +
                        quote(description)
                    );
                }
            });

        } catch (error) {
            console.error(`[${config.pkg.name}] Error:`, error);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};