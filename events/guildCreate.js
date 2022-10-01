const { getGuild, createGuild } = require('../strapi');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        const guildQueried = await getGuild(guild.id);
        if (guildQueried.guilds.data.length === 0) {
            await createGuild(guild.id, guild.name);
        }
        console.log(`Bot has been added to guild "${guild.name}"`);
    },
};
