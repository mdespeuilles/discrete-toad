const url = require('url');
const axios = require('axios');
const cheerio = require('cheerio');
const { getAbsoluteUrl } = require('./utils');
const alert = require('cli-alerts');

const visitedLinks = new Set();

const getAllLinks = async baseUrl => {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    const domain = new url.URL(baseUrl).hostname;
    const links = new Set();

    $('a').each((i, element) => {
      const href = $(element).attr('href');
      if (!href) return;
      const fullUrl = getAbsoluteUrl(baseUrl, href);
      if (new url.URL(fullUrl).hostname === domain) {
        links.add(fullUrl);
      }
    });

    return links;
  } catch (error) {
    console.error(`Erreur lors de la récupération des liens de ${baseUrl}: ${error}`);
    return new Set();
  }
};

const getResourceInfo = async resourceUrl => {
  if (visitedLinks.has(resourceUrl)) return;
  visitedLinks.add(resourceUrl);
  try {
    const start = Date.now();
    const response = await axios.get(resourceUrl);
    const end = Date.now();
    const responseTime = (end - start) / 1000; // Temps de réponse en secondes
    const httpVersion = response.request.res.httpVersion;
    const indexability = response.headers['x-robots-tag'] ? response.headers['x-robots-tag'] : 'indexable';

    let contentLength = response.headers['content-length'];
    contentLength = contentLength ? parseInt(contentLength, 10) / 1024 : null;

    const lastModified = response.headers['last-modified'] ? response.headers['last-modified'] : 'Non spécifié';
    const contentType = response.headers['content-type'] || 'Inconnu';

    alert({
      type: `success`,
      name: 'Scrap :' + resourceUrl,
      msg: `${response.status} - ${responseTime * 1000}ms`
    });

    return {
      url: resourceUrl,
      title: null,
      description: null,
      statusCode: response.status,
      responseTime: responseTime,
      contentType: contentType,
      httpVersion: httpVersion,
      lastModified: lastModified,
      canonical: null,
      wordCount: null,
      indexability: indexability,
      sizeKB: contentLength !== null ? contentLength.toFixed(2) : 'Inconnu'
    };
  } catch (error) {
    alert({
      type: `error`,
      name: 'Error :' + resourceUrl,
      msg: `${error.message}`
    });
    return {
      url: resourceUrl,
      error: error.message
    };
  }
};

const scrapePage = async (pageUrl, htmlOnly) => {
  //console.log("Analyse :"+pageUrl)
  const pageRessources = [];
  try {
    const start = Date.now();
    const response = await axios.get(pageUrl);
    const end = Date.now();
    const responseTime = (end - start) / 1000;

    const $ = cheerio.load(response.data);
    const title = $('title').text() || 'Pas de titre';
    const description = $('meta[name="description"]').attr('content') || 'Pas de description';
    const contentType = response.headers['content-type'] || 'Inconnu';
    const httpVersion = response.request.res.httpVersion;
    const lastModified = response.headers['last-modified'] || 'Non spécifié';
    const canonical = $('link[rel="canonical"]').attr('href') || 'Non spécifié';
    const wordCount = $('body')
      .text()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    let indexability = 'indexable';

    if (response.headers['x-robots-tag']) {
      indexability = response.headers['x-robots-tag'];
    } else if ($('meta[name="robots"]').attr('content')) {
      indexability = $('meta[name="robots"]').attr('content');
    }

    let contentLength = response.headers['content-length'];
    contentLength = contentLength ? parseInt(contentLength, 10) / 1024 : null;

    const htmlRessource = {
      url: pageUrl,
      title: title,
      description: description,
      statusCode: response.status,
      responseTime: responseTime,
      contentType: contentType,
      httpVersion: httpVersion,
      lastModified: lastModified,
      canonical: canonical,
      wordCount: wordCount,
      indexability: indexability,
      sizeKB: contentLength !== null ? contentLength.toFixed(2) : 'Inconnu'
    };

    pageRessources.push(htmlRessource);

    alert({
      type: `success`,
      name: 'Scrap :' + pageUrl,
      msg: `${response.status} - ${responseTime * 1000}ms`
    });

    if (!htmlOnly) {
      const resourceUrls = [
        ...$('img')
          .map((i, el) => $(el).attr('src'))
          .get(),
        ...$('link[rel="stylesheet"]')
          .map((i, el) => $(el).attr('href'))
          .get(),
        ...$('script[src]')
          .map((i, el) => $(el).attr('src'))
          .get()
      ];

      for (const resourceUrl of resourceUrls) {
        const absoluteUrl = getAbsoluteUrl(pageUrl, resourceUrl);
        const resourceInfo = await getResourceInfo(absoluteUrl);
        pageRessources.push(resourceInfo);
      }
    }
  } catch (error) {
    alert({
      type: `error`,
      name: 'Error :' + pageUrl,
      msg: `${error}`
    });
  }

  return pageRessources;
};

const scrapePageRecursively = async (pageUrl, currentDepth, maxDepth, htmlOnly) => {
  if (currentDepth > maxDepth || visitedLinks.has(pageUrl)) return;
  try {
    visitedLinks.add(pageUrl);
    const pageRessources = await scrapePage(pageUrl, htmlOnly);

    let allRessources = [...pageRessources];

    const links = await getAllLinks(pageUrl);
    for (const link of links) {
      const extraRessources = await scrapePageRecursively(link, currentDepth + 1, maxDepth, htmlOnly);
      allRessources = allRessources.concat(extraRessources);
    }

    return allRessources;
  } catch (error) {
    console.error(`Erreur lors du scrapping de ${pageUrl}: ${error}`);
  }
};

module.exports = {
  getAllLinks,
  getResourceInfo,
  scrapePage,
  scrapePageRecursively
};
