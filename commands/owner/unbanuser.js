const {
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "unbanuser",
    aliases: ["unban", "ubu"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        if (await middleware(ctx, module.exports.permissions)) return;

        const userId = ctx.args.join(" ") || null;

        const senderJid = ctx.sender.jid;
        const senderId = senderJid.split(/[:@]/)[0];
        const mentionedJids = ctx.msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const user = Array.isArray(mentionedJids) && mentionedJids.length > 0 ? mentionedJids[0] : (userId ? `${userId}@s.whatsapp.net` : null);

        if (!user) return await ctx.reply({
            text: `${quote(tools.msg.generateInstruction(["send"], ["text"]))}\n` +
                quote(tools.msg.generateCommandExample(ctx._used, `@${senderId}`)),
            mentions: [senderJid]
        });

        try {
            const [result] = await ctx._client.onWhatsApp(user);
            if (!result.exists) return await ctx.reply(quote(`❎ Akun tidak ada di WhatsApp!`));

            await db.set(`user.${user.split("@")[0]}.banned`, false);

            await ctx.sendMessage(user, {
                text: quote(`🎉 Anda telah diunbanned oleh Owner!`)
            });
            await ctx.reply(quote(`✅ Berhasil diunbanned!`));
        } catch (error) {
            consolefy.error(`Error: ${error}`);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};