const { getGuild, createGuild, updateGuild } = require('../strapi');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        const fetchedGuilds = await client.guilds.fetch();
        console.log(`Currently serving ${fetchedGuilds.size} guilds`);

        fetchedGuilds.forEach(async (fetchedGuild) => {
            const guildQueried = await getGuild(fetchedGuild.id);
            if (guildQueried.guilds.data.length === 0) {
                await createGuild(fetchedGuild.id, fetchedGuild.name);
            }
            else if (guildQueried.guilds.data[0].attributes.name != fetchedGuild.name) {
                await updateGuild(guildQueried.guilds.data[0].id, fetchedGuild.name);
            }
        });

    },
};
