const { GraphQLClient, gql } = require('graphql-request');
const { strapiToken } = require('./config.json');

const endpoint = 'http://localhost:1337/graphql';
const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        authorization: `Bearer ${strapiToken}`,
    },
});

async function query(queryText) {
    return await graphQLClient.request(gql`${queryText}`);
}

async function getGuild(guildId) {
    return await query(`
        query {
            guilds (filters: { guildId: { eq: "${guildId}"}}){
                data { 
                    id
                    attributes {
                        name
                    }
                }
            }
        }
    `);
}

async function createGuild(guildId, name) {
    return await query(`
        mutation {
            createGuild(
                data: {
                    guildId: "${guildId}"
                    name: "${name}"
                }
            ) { data { id } }
        }`,
    );
}

async function updateGuild(id, name) {
    return await query(`
    mutation {
        updateGuild(id: ${id}, data: { name: "${name}" }) {
          data { id }
        }
    }
    `);
}

async function getMember(memberId) {
    return await query(`
        query {
            members (filters: { memberId: { eq: "${memberId}" }}) {
                data { id, attributes { guilds { data { id } } } } }
        }
    `);
}

async function createMember(memberId, name, guilds) {
    return await query(`
        mutation {
            createMember(
                data: {
                    memberId: "${memberId}"
                    name: "${name}"
                    guilds: ${guilds}
                }
            ) { data { id } }
        }
    `);
}

async function updateMember(id, name, guilds) {
    return await query(`
        mutation {
            updateMember(id: ${id}
                data: {
                    name: "${name}"
                    guilds: ${guilds}
                }
            ) { data { id } }
        }
    `);
}

async function createEvent(guild, member, quote = null) {
    function q() {
        if (quote) { return `quote: "${quote}"`; }
        else { return ''; }
    }

    return await query(`
        mutation {
            createEvent(
                data: {
                    guild: ${guild}
                    member: ${member}
                    ${q(quote)}
                }
            ) { data { id } }
        }
    `);
}

async function getLastEvent(member, guild) {
    return await query(`
        query {
            events(
                filters: { member: { id: { eq: ${member} } }, guild: { id: { eq: ${guild} } } }
                sort: "createdAt:desc"
                pagination: { limit: 1 }
            ) {
                data { attributes { createdAt } }
            }
        }
    `);
}

module.exports = { getGuild, createGuild, updateGuild, getMember, createMember, updateMember, createEvent, getLastEvent };
