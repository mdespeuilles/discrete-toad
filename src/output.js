const { printTable, Table } = require('console-table-printer');

const displayResult = async results => {
  const p = new Table({
    columns: [
      {
        name: 'url',
        maxLen: 5,
        alignment: 'left'
      },
      {
        name: 'statutsCode',
        alignment: 'left'
      },
      {
        name: 'responseTime',
        alignment: 'left'
      },
      {
        name: 'contentType',
        alignment: 'left'
      },
      {
        name: 'httpVersion',
        alignment: 'left'
      },
      {
        name: 'lastModified',
        alignment: 'left'
      },
      {
        name: 'wordCount',
        alignment: 'left'
      },
      {
        name: 'indexability',
        alignment: 'left'
      },
      {
        name: 'sizeKB',
        alignment: 'left'
      }
    ]
  });

  for (const result of results) {
    delete result.canonical;
    delete result.title;
    delete result.description;

    let color = 'green';
    if (result.statusCode >= 400) {
      color = 'red';
    }

    p.addRow(result, { color: color });
  }

  p.printTable();
};

module.exports = { displayResult };
