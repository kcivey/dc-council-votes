#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');
const {hsluvToHex} = require('hsluv');
const db = require('./lib/db');
const outFile = __dirname + '/council-votes.html';
const maxSame = 100;
let minSame = 100;

main().catch(console.error).finally(() => db.destroy());

async function main() {
    const rows = await getData();
    const counts = {};
    for (const row of rows) {
        const {name1, name2, same, total} = row;
        if (!counts[name1]) {
            counts[name1] = {};
        }
        counts[name1][name2] = {same, total};
        if (same < minSame) {
            minSame = same;
        }
    }
    const template = _.template(fs.readFileSync(outFile + '.tpl', 'utf-8'));
    fs.writeFileSync(outFile, template({counts, makeStyle}));
}

function getData() {
    return db.raw(
        `SELECT
            m1.name AS name1,
            m2.name AS name2,
            SUM(CASE WHEN mv1.result = mv2.result THEN 1 ELSE 0 END) AS same,
            COUnt(*) AS total
        FROM member_votes mv1, member_votes mv2, members m1, members m2, votes v
        WHERE mv1.council_period = mv2.council_period AND mv1.vote_id = mv2.vote_id
            AND mv1.council_period = m1.council_period AND m1.id = mv1.member_id
            AND mv2.council_period = m2.council_period AND m2.id = mv2.member_id
            AND v.council_period = mv1.council_period AND v.id = mv1.vote_id
            AND v.noes > 0
            AND mv1.result IN (1, 2) AND mv2.result IN (1, 2)
            AND mv1.council_period >= ?
        GROUP BY 1, 2`,
        [22]
    );
}

function makeStyle(percent) {
    const minLevel = 90;
    const maxLevel = 40;
    const level = minLevel + (maxLevel - minLevel) * (percent - minSame) / (maxSame - minSame);
    const background = hsluvToHex([255, 100, level]);
    const color = level < 65 ? 'white' : 'black';
    return ` style="background-color: ${background}; color: ${color};"`;
}
