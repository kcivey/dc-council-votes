#!/usr/bin/env node

const db = require('./lib/db');
const request = require('./lib/request');
const client = require('dc-council-lims').createClient({request});
const batchSize = 100;
const voteResults = {
    Yes: 1,
    No: 2,
    Absent: 3,
    Abstain: 4,
    Present: 5,
    Recused: 6,
    Vacant: 7,
    Other: 8,
};
const memberById = {};

main().catch(console.error);

async function main() {
    await createTables();
    let voteId = 0;
    for (let councilPeriod = 23; councilPeriod >= 22; councilPeriod--) {
        for (let offset = 0; offset < 100; offset++) {
            const votes = await client.getVotes({councilPeriod}, batchSize, offset);
            if (!votes) {
                break;
            }
            const voteRows = [];
            const memberVoteRows = [];
            for (const vote of votes) {
                voteId++;
                voteRows.push({
                    id: voteId,
                    council_period: councilPeriod,
                    number: vote.LegislationNumber,
                    title: vote.Title,
                });
                for (const r of vote.MemberVotes) {
                    const memberId = r.MemberId;
                    if (!memberById[memberId]) {
                        memberById[memberId] = r.MemberName;
                    }
                    const result = voteResults[r.Result];

                    if (!result) {
                        throw new Error(`Unknown vote result "${r.Result}"`);
                    }
                    memberVoteRows.push({
                        vote_id: voteId,
                        member_id: memberId,
                        result,
                    });
                }
            }
            await db.batchInsert('votes', voteRows, 100);
            await db.batchInsert('member_votes', memberVoteRows, 100);
            console.warn(councilPeriod, offset, votes.length);
        }
    }
    await db.batchInsert('members', Object.entries(memberById).map(([key, value]) => ({id: key, name: value})));
}

function createTables() {
    return db.schema.dropTableIfExists('members')
        .dropTableIfExists('member_votes')
        .dropTableIfExists('votes')
        .createTable(
            'members',
            function (table) {
                table.integer('id');
                table.string('name');
                table.unique('id');
            }
        )
        .createTable(
            'votes',
            function (table) {
                table.integer('id');
                table.integer('council_period');
                table.string('number');
                table.string('title');
                table.integer('noes');
            }
        )
        .createTable(
            'member_votes',
            function (table) {
                table.integer('vote_id');
                table.integer('member_id');
                table.integer('result');
                table.unique(['vote_id', 'member_id']);
            }
        );
}
