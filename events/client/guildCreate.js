const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "guildCreate",
  async execute(guild, client) {
    const db = require('../../db');
    const channelName = '🎵┊𝓯𝓾𝓻𝓲𝓶𝓾𝓼𝓲𝓬';
    const voiceName = '🔊┊𝓿𝓸𝓲𝓬𝓮';
    const categoryName = '🎵┊𝓶𝓾𝓼𝓲𝓬';
    try {
      const saved = db.getChannelIds(guild.id);

      let category = null;
      if (saved?.categoryId) {
        try {
          const fetched = await guild.channels.fetch(saved.categoryId);
          if (fetched?.type === ChannelType.GuildCategory) category = fetched;
        } catch {}
      }
      if (!category) {
        category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
      }
      if (!category) {
        category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
        });
      }

      let channel = null;
      if (saved?.textChannelId) {
        try {
          const fetched = await guild.channels.fetch(saved.textChannelId);
          if (fetched?.type === ChannelType.GuildText) channel = fetched;
        } catch {}
      }
      if (!channel) {
        channel = guild.channels.cache.find(c => c.name === channelName && c.type === ChannelType.GuildText);
      }
      if (!channel) {
        channel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
          topic: "Paste a song name or link here to play music",
          permissionOverwrites: [
            {
              id: guild.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
          ],
        });

        const { buildIntroEmbed } = require('../../functions/intro');
        await channel.send({ embeds: [buildIntroEmbed(client)] });
      }

      let voice = null;
      if (saved?.voiceChannelId) {
        try {
          const fetched = await guild.channels.fetch(saved.voiceChannelId);
          if (fetched?.type === ChannelType.GuildVoice) voice = fetched;
        } catch {}
      }
      if (!voice) {
        voice = guild.channels.cache.find(c => c.name === voiceName && c.type === ChannelType.GuildVoice);
      }
      if (!voice) {
        voice = await guild.channels.create({
          name: voiceName,
          type: ChannelType.GuildVoice,
          parent: category.id,
        });
      }

      db.saveChannelIds(guild.id, category.id, channel.id, voice.id);

      if (!client.musicSetup) client.musicSetup = {};
      if (channel) client.musicSetup[guild.id] = channel.id;

      console.log(`Setup music channels in ${guild.name} (${guild.id})`);
    } catch (err) {
      console.error(`Failed to setup music channels in ${guild.name}:`, err.message);
    }
  },
};
