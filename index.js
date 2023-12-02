#!/usr/bin/env node

const init = require('./utils/init');
const cli = require('./utils/cli');
//const log = require('./utils/log');

const { scrapePageRecursively } = require('./src/scraper');
const { exportToCsv } = require('./src/csvExport');
const { displayResult } = require('./src/output');

const input = cli.input;
const flags = cli.flags;

(async () => {
  init(false);
  //input.includes(`help`) && cli.showHelp(0);

  let results = await scrapePageRecursively(flags.url, 1, flags.depth, flags.html);

  results = results.filter(function (element) {
    return element !== undefined;
  });

  if (flags.out) {
    await exportToCsv(results, flags.out);
  }

  await displayResult(results);
})();
