const { SlashCommandBuilder } = require('discord.js');
const { getGuild, getMember, createMember, updateMember, createEvent, getLastEvent, getAllEvents } = require('../strapi');
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

        const memberIdQueried = await memberId();

        const lastEvent = await getLastEvent(memberIdQueried, guildQueried.guilds.data[0].id);

        const lastEventDate = lastEvent.events.data.length === 1 ? Date.parse(lastEvent.events.data[0].attributes.createdAt) : null;
        const msPassed = lastEventDate ? Date.now() - lastEventDate : null;

        let unit = new String;
        let timeConvertedPassed = new Number;

        if (msPassed) {
            switch (true) {
            case msPassed < 1000:
                timeConvertedPassed = msPassed;
                unit = {
                    def: 'ms',
                    ru: 'мс',
                    uk: 'мс',
                };
                break;
            case msPassed < 60000:
                timeConvertedPassed = msPassed / 1000;
                unit = {
                    def: 's',
                    ru: 'с',
                    uk: 'с',
                };
                break;
            case msPassed < 3600000:
                timeConvertedPassed = msPassed / 60000;
                unit = {
                    def: 'min',
                    ru: 'мин',
                    uk: 'хв',
                };
                break;
            case msPassed < 86400000:
                timeConvertedPassed = msPassed / 3600000;
                unit = {
                    def: 'h',
                    ru: 'ч',
                    uk: 'год',
                };
                break;
            case msPassed >= 86400000:
                timeConvertedPassed = msPassed / 86400000;
                unit = {
                    def: 'd',
                    ru: 'д',
                    uk: 'д',
                };
                break;
            }
        }

        await createEvent(guildQueried.guilds.data[0].id, memberIdQueried, quote);

        const tolalEvents = await getAllEvents(memberIdQueried, guildQueried.guilds.data[0].id);

        const locales = {
            def: stripIndents`
                Days past since last friendly killing: 0.
                Prior to this, ${userMentioned} ${msPassed ? `held out for ${timeConvertedPassed.toFixed()} ${unit[interaction.locale] ?? unit.def}.` : 'did not kill anyone.' }
                In total, ${userMentioned} shot at friendlies ${tolalEvents.events.data.length} times.
            `,
            ru: stripIndents`
                Дней прошло с последнего убийства союзника: 0.
                До этого ${userMentioned} ${msPassed ? `держался ${timeConvertedPassed.toFixed()} ${unit[interaction.locale] ?? unit.def}.` : 'никого не убивал.' }
                Всего ${userMentioned} стрелял по своим ${tolalEvents.events.data.length} раз.
            `,
            uk: stripIndents`
                Днів минуло з останнього вбивства союзника: 0
                До цього ${userMentioned} ${msPassed ? `тримався ${timeConvertedPassed.toFixed()} ${unit[interaction.locale] ?? unit.def}.` : 'нікого не вбивав.' }
                Усього ${userMentioned} стріляв по своїх ${tolalEvents.events.data.length} разів.
            `,
        };

        await interaction.reply(locales[interaction.locale] ?? locales.def);
    },
};
