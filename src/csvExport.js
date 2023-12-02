const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Fonction pour exporter en CSV
const exportToCsv = async (results, outFile) => {
  const csvWriter = createCsvWriter({
    path: outFile, // Nom du fichier de sortie
    header: [
      { id: 'url', title: 'URL' },
      { id: 'title', title: 'Title' },
      { id: 'description', title: 'Description' },
      { id: 'statutsCode', title: 'statutsCode' },
      { id: 'responseTime', title: 'responseTime' },
      { id: 'contentType', title: 'contentType' },
      { id: 'httpVersion', title: 'httpVersion' },
      { id: 'lastModified', title: 'lastModified' },
      { id: 'canonical', title: 'canonical' },
      { id: 'wordCount', title: 'wordCount' },
      { id: 'indexability', title: 'indexability' },
      { id: 'sizeKB', title: 'sizeKB' }
    ],
    fieldDelimiter: ';',
    appendBOM: true
  });
  await csvWriter.writeRecords(results);
  console.log(`Les données ont été écrites dans ${outFile}`);
};

module.exports = { exportToCsv };
