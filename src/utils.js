const url = require('url');

const getAbsoluteUrl = (base, relative) => {
  return new url.URL(relative, base).href;
};

module.exports = { getAbsoluteUrl };
