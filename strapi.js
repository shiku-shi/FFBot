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

module.exports = { getGuild, createGuild, updateGuild };
