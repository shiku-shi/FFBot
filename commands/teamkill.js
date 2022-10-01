const { SlashCommandBuilder } = require('discord.js');
const { getGuild, getMember, createMember, updateMember } = require('../strapi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teamkill')
        .setNameLocalizations({
            ru: 'тимкил',
            uk: 'тiмкiл',
        })
        .setDescription('Add friendly fire event')
        .setDescriptionLocalizations({
            ru: 'Добавить событие дружественного огня',
            uk: 'Додати подію дружнього вогню',
        })
        .addUserOption(option =>
            option.setName('member')
                .setNameLocalizations({
                    ru: 'член',
                    uk: 'член',
                })
                .setDescription('The guilty member (empty means You)')
                .setDescriptionLocalizations({
                    ru: 'Провинившийся член (пустое поле означает тебя)',
                    uk: 'Член, що провинився (порожнє поле означає тебе)',
                }),
        )
        .addStringOption(option =>
            option.setName('quote')
                .setNameLocalizations({
                    ru: 'цитата',
                    uk: 'цитата',
                })
                .setDescription('Last words before tradic events happened')
                .setDescriptionLocalizations({
                    ru: 'Последние слова перед трагическим событием',
                    uk: 'Останні слова перед трагічною подією',
                }),
        ),
    async execute(interaction) {

        const memberQueried = await getMember(interaction.user.id);
        const guildQueried = await getGuild(interaction.guildId);

        if (memberQueried.members.data.length === 0) {
            const guilds = new Array;
            guilds.push(guildQueried.guilds.data[0].id);
            await createMember(interaction.user.id, interaction.user.tag, guilds);
        }
        else {
            const existingGuilds = memberQueried.members.data[0].attributes.guilds.data.map((e) => e.id);
            if (!existingGuilds.includes(guildQueried.guilds.data[0].id)) {
                existingGuilds.push(guildQueried.guilds.data[0].id);
                await updateMember(memberQueried.members.data[0].id, interaction.user.tag, JSON.stringify(existingGuilds));
            }
        }

        await interaction.reply('Pong!');
    },
};
