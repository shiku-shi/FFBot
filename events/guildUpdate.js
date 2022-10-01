const { getGuild, updateGuild } = require('../strapi');

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild) {
        const guildQueried = await getGuild(oldGuild.id);
        if (guildQueried.guilds.data.length === 1) {
            await updateGuild(guildQueried.guilds.data[0].id, newGuild.name);
        }
        console.log(`Guild "${oldGuild.name}" has been renamed to "${newGuild.name}"`);
    },
};
