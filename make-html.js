#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');
const db = require('./lib/db');
const outFile = __dirname + '/council-votes.html';

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
    }
    const template = _.template(fs.readFileSync(outFile + '.tpl', 'utf-8'));
    fs.writeFileSync(outFile, template({counts, makeStyle}));
}

function getData() {
    return db.raw(
        `select
            m1.name as name1,
            m2.name as name2,
            sum(case when mv1.result=mv2.result then 1 else 0 end) as same,
            count(*) as total
        from member_votes mv1, member_votes mv2, members m1, members m2, votes v
        where mv1.vote_id=mv2.vote_id
            and m1.id=mv1.member_id and m2.id=mv2.member_id
            and v.id=mv1.vote_id
            and v.noes>0
            and mv1.result in (1,2)
            and mv2.result in (1,2)
        group by 1,2`
    );
}

function makeStyle(percent) {
    const min = 25;
    const level = (100 * (1 - (percent - min) / (100 - min))).toFixed(2);
    const background = `rgb(${level}%, ${level}%, 100%)`;
    const color = +level < 50 ? 'white' : 'black';
    return ` style="background-color: ${background}; color: ${color};"`;
}
