const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('input')
            .setDescription('The input to echo back')
            .setRequired(true)),
    async execute(interaction) {
        input = interaction.options.getString('input');
        if (input === 'da') {
            await interaction.reply('pizda');
        } else {
            await interaction.reply(input);
        }
    }
}

