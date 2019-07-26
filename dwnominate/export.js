#!/usr/bin/env node

const fs = require('fs');
const db = require('../lib/db');

main();

async function main() {
    for (const councilPeriod of [22, 23]) {
        const records = await getRecords(councilPeriod);
        const dataByMember = {};
        for (const {name, result} of records) {
            if (!dataByMember[name]) {
                dataByMember[name] = '';
            }
            dataByMember[name] += result || '0';
        }
        const file = __dirname + '/votes-' + councilPeriod + '.fwf';
        fs.unlinkSync(file);
        for (const [name, votes] of Object.entries(dataByMember)) {
            fs.appendFileSync(file, makeShortName(name).padEnd(12, ' ') + votes + '\n');
        }
    }
    process.exit();
}

function getRecords(councilPeriod) {
    return db.raw(
        `SELECT m.name, v.council_period, v.id AS vote_id, mv.result
        FROM votes v
            LEFT JOIN member_votes mv ON v.council_period = mv.council_period AND v.id = mv.vote_id
            LEFT JOIN members m ON mv.council_period = m.council_period AND mv.member_id = m.id
        WHERE mv.council_period = ?
            AND v.noes > 0
        ORDER BY 1, 2, 3`,
        [councilPeriod]
    );
}

function makeShortName(name) {
    const parts = name.split(/\s+/);
    // let suffix;
    let shortName = parts.pop();
    if (shortName.match(/^(?:[JS]r\.?|I+|I?V)$/)) {
        // suffix = shortName;
        shortName = parts.pop();
    }
    if (shortName === 'White') {
        shortName = parts[0].substr(0, 1) + ' ' + shortName;
    }
    return shortName;
}
