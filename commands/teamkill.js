const { SlashCommandBuilder } = require('discord.js');
const { getGuild, getMember, createMember, updateMember, createEvent, getLastEvent } = require('../strapi');
const { stripIndents } = require('common-tags');

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

        const userMentioned = interaction.options.getUser('member') ?
            interaction.options.getUser('member') :
            interaction.user;

        const memberQueried = await getMember(userMentioned.id);

        const guildQueried = await getGuild(interaction.guildId);

        async function memberId() {
            if (memberQueried.members.data.length === 0) {
                const guilds = new Array;
                guilds.push(guildQueried.guilds.data[0].id);
                const newMember = await createMember(userMentioned.id, userMentioned.tag, JSON.stringify(guilds));
                return newMember.createMember.data.id;
            }
            else {
                const existingGuilds = memberQueried.members.data[0].attributes.guilds.data.map((e) => e.id);
                if (!existingGuilds.includes(guildQueried.guilds.data[0].id)) {
                    existingGuilds.push(guildQueried.guilds.data[0].id);
                    await updateMember(memberQueried.members.data[0].id, interaction.user.tag, JSON.stringify(existingGuilds));
                }
                return memberQueried.members.data[0].id;
            }
        }

        const quote = interaction.options.getString('quote');

        const lastEvent = await getLastEvent(await memberId(), guildQueried.guilds.data[0].id);

        await createEvent(guildQueried.guilds.data[0].id, await memberId(), quote);

        const locales = {
            def: stripIndents`
                Days past since last friendly killing: 0
                Prior to this, ${userMentioned} ${lastEvent.events.data.length === 0 ? 'did not kill anyone' : 'held out for ' + lastEvent.events.data[0].attributes.createdAt }
            `,
            ru: stripIndents`
                Дней прошло с последнего убийства союзника: 0
                До этого ${userMentioned} держался ${lastEvent}
            `,
            uk: stripIndents`
                Днів минуло з останнього вбивства союзника: 0
                До цього ${userMentioned} тримався ${lastEvent}
            `,
        };

        await interaction.reply(locales[interaction.locale] ?? locales.def);
    },
};
