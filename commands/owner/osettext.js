const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "osettext",
    aliases: ["osettxt"],
    category: "owner",
    permissions: {
        owner: true
    },
    code: async (ctx) => {
        if (await middleware(ctx, module.exports.permissions)) return;

        const key = ctx.args[0];
        const text = ctx.args.slice(1).join(" ");

        if (!key && !text) return await ctx.reply(
            `${quote(`${tools.msg.generateInstruction(["send"], ["text"])}`)}\n` +
            `${quote(tools.msg.generateCommandExample(ctx._used, "price $1 untuk sewa bot 1 bulan"))}\n` +
            quote(tools.msg.generateNotes([`Ketik ${monospace(`${ctx._used.prefix + ctx._used.command} list`)} untuk melihat daftar.`]))
        );

        if (ctx.args[0] === "list") {
            const listText = await tools.list.get("osettext");
            return await ctx.reply(listText);
        }

        try {
            let setKey;

            switch (key.toLowerCase()) {
                case "price":
                    setKey = `bot.text.price`;
                    break;
                default:
                    return await ctx.reply(quote(`❎ Key '${key}' tidak valid!`));
            }

            await db.set(setKey, text);
            return await ctx.reply(quote(`✅ Pesan untuk key '${key}' berhasil disimpan!`));
        } catch (error) {
            consolefy.error(`Error: ${error}`);
            return await ctx.reply(quote(`⚠️ Terjadi kesalahan: ${error.message}`));
        }
    }
};