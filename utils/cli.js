const meow = require('meow');
const meowHelp = require('cli-meow-help');

const flags = {
  debug: {
    type: `boolean`,
    default: false,
    desc: `Print debug info`
  },
  version: {
    type: `boolean`,
    alias: `v`,
    desc: `Print CLI version`
  },
  url: {
    alias: `u`,
    desc: `Website url`,
    type: `string`,
    isRequired: true
  },
  depth: {
    alias: `d`,
    desc: `Max scrapping depth`,
    type: `number`,
    default: 5
  },
  html: {
    type: `boolean`,
    desc: `Scrape only HTML resources`,
    default: false
  },
  out: {
    alias: `o`,
    desc: `Path to export results as CSV`,
    type: `string`
  }
};

const commands = {
  help: { desc: `Print help info` }
};

const helpText = meowHelp({
  name: `dtoad`,
  flags,
  commands
});

const options = {
  inferType: true,
  description: false,
  hardRejection: false,
  flags
};

module.exports = meow(helpText, options);
