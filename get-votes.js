#!/usr/bin/env node

const argv = require('yargs')
    .options({
        'council': {
            type: 'number',
            describe: 'council period to retrieve votes for',
            default: Math.round((new Date().getFullYear() - 1973) / 2),
        },
        'delete': {
            type: 'boolean',
            describe: 'delete tables before loading data',
        },
    })
    .strict(true)
    .argv;
const db = require('./lib/db');
const request = require('./lib/request');
const client = require('dc-council-lims').createClient({request, minInterval: 0});
const batchSize = 100;
const voteResults = {
    'Yes': 1,
    'No': 2,
    'Absent': 3,
    'Abstained': 4,
    'Present': 5,
    'Recused': 6,
    'Vacant': 7,
    'Other': 8,
    '': 0, // Not sure what this should be, probably an error in the data
};
const memberById = {};

main().catch(console.error).finally(() => db.destroy());

async function main() {
    await db.raw('PRAGMA foreign_keys = ON');
    if (argv.delete) {
        await deleteTables();
    }
    await createTables();
    const councilPeriod = argv.council;
    await deleteRecords(councilPeriod);
    let voteId = 0;
    for (let offset = 0; offset < 100; offset++) {
        const votes = await client.getVotes({councilPeriod}, batchSize, offset);
        if (!votes) {
            console.warn('votes', votes);
            break;
        }
        const memberRows = [];
        const voteRows = [];
        const memberVoteRows = [];
        for (const vote of votes) {
            voteId++;
            let noes = 0;
            let yeses = 0;
            for (const r of vote.MemberVotes) {
                const memberId = r.MemberId;
                if (!memberById[memberId]) {
                    memberRows.push({
                        council_period: councilPeriod,
                        id: memberId,
                        name: r.MemberName,
                    });
                    memberById[memberId] = r.MemberName;
                }
                const result = voteResults[r.Result];
                if (result == null) {
                    console.warn(vote);
                    throw new Error(`Unknown vote result "${r.Result}"`);
                }
                if (result === 1) {
                    yeses++;
                }
                else if (result === 2) {
                    noes++;
                }
                memberVoteRows.push({
                    council_period: councilPeriod,
                    vote_id: voteId,
                    member_id: memberId,
                    result,
                });
            }
            voteRows.push({
                council_period: councilPeriod,
                id: voteId,
                date: vote.DateOfVote.replace(/^(\d+)\/(\d+)\/(\d+) .*/, '$1-$2-$3'),
                number: vote.LegislationNumber,
                title: vote.Title,
                noes,
                yeses,
            });
        }
        await db.batchInsert('members', memberRows, 100);
        await db.batchInsert('votes', voteRows, 100);
        await db.batchInsert('member_votes', memberVoteRows, 100);
        console.warn(councilPeriod, offset, votes.length);
    }
}

function deleteTables() {
    return db.schema
        .dropTableIfExists('members')
        .dropTableIfExists('member_votes')
        .dropTableIfExists('votes');
}

async function createTables() {
    let exists = await db.schema.hasTable('members');
    if (!exists) {
        await db.schema.createTable(
            'members',
            function (table) {
                table.integer('council_period').notNullable();
                table.integer('id').notNullable();
                table.string('name').notNullable();
                table.primary(['council_period', 'id']);
            }
        );
    }
    exists = await db.schema.hasTable('votes');
    if (!exists) {
        await db.schema.createTable(
            'votes',
            function (table) {
                table.integer('council_period').notNullable();
                table.integer('id').notNullable();
                table.date('date').notNullable();
                table.string('number').notNullable();
                table.string('title').notNullable();
                table.integer('noes').notNullable();
                table.integer('yeses').notNullable();
                table.primary(['council_period', 'id']);
            }
        );
    }
    exists = await db.schema.hasTable('member_votes');
    if (!exists) {
        return db.schema.createTable(
            'member_votes',
            function (table) {
                table.integer('council_period').notNullable();
                table.integer('vote_id').notNullable();
                table.integer('member_id').notNullable();
                table.integer('result').notNullable();
                table.primary(['council_period', 'vote_id', 'member_id']);
                table.foreign(['council_period', 'member_id'])
                    .references(['council_period', 'id'])
                    .inTable('members')
                    .onDelete('CASCADE');
                table.foreign(['council_period', 'vote_id'])
                    .references(['council_period', 'id'])
                    .inTable('votes')
                    .onDelete('CASCADE');
            }
        );
    }
}

async function deleteRecords(councilPeriod) {
    await db('members').where('council_period', councilPeriod).del();
    await db('votes').where('council_period', councilPeriod).del();
    return await db('votes').where('council_period', councilPeriod).del();
}
