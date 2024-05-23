const fs = require('fs')
const path = require('path')
const csvParser = require('csv-parser')
const { Client } = require('pg')

const inputFolder = './input'

const processFile = async (filePath, client) => {
  const data = []
  const stream = fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      // Push in here the filtering and processing of the data that is in the original file.

      // Format the processed data into a string.
      const formattedRow = `(${Object.values(row).join(',')})`
      data.push(formattedRow)
    })

  await new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })

  const sqlScript = `INSERT INTO temp_cpr_values (
    // Replace with column names
    // column1, column2, column3
  ) VALUES ${data.join(',\n')}`

  try {
    await client.query(sqlScript)
    console.log(`Data inserted into database from file: ${filePath}`)
  } catch (err) {
    console.error('Error executing query:', err)
  }
}

const processFiles = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
    // ...
  })

  await client.connect()

  const createTableScript = `CREATE TABLE IF NOT EXISTS temp_cpr_values (
    CorrelationId VARCHAR(36),
    FRN BIGINT,
    ClaimNumber VARCHAR(50),
    AgreementNumber VARCHAR(20),
    MarketingYear INT,
    OriginalInvoiceNumber VARCHAR(30),
    InvoiceNumber VARCHAR(30),
    Currency VARCHAR(3),
    PaymentRequestNumber INT,
    Value INT,
    Batch VARCHAR(255),
    SourceSystem VARCHAR(50),
    BatchExportDate TIMESTAMP WITH TIME ZONE,
    Status VARCHAR(255),
    LastUpdated TIMESTAMP WITH TIME ZONE,
    RevenueOrCapital VARCHAR(10),
    Year INT,
    RoutedToRequestEditor VARCHAR(1),
    DeltaAmount INT,
    APValue INT,
    ARValue INT,
    DebtType VARCHAR(14),
    DAXFileName VARCHAR(255),
    DAXImported VARCHAR(1),
    SettledValue INT,
    PHError VARCHAR(255),
    DAXError VARCHAR(255),
    ReceivedInRequestEditor TIMESTAMP WITH TIME ZONE,
    Enriched VARCHAR(1),
    LedgerSplit VARCHAR(1),
    ReleasedFromRequestEditor TIMESTAMP WITH TIME ZONE
  )`

  try {
    await client.query(createTableScript)
    console.log('Table created or already exists')
  } catch (err) {
    console.error('Error creating table:', err)
  }

  fs.readdir(inputFolder, (err, files) => {
    if (err) {
      console.error('Error reading input folder:', err)
      return
    }

    files.forEach(file => {
      if (file.startsWith('cpr-') && file.endsWith('.csv')) {
        const filePath = path.join(inputFolder, file)
        processFile(filePath, client)
      }
    })
  })
}
// add in some more error handling here as it's not covered
// Also add in some server closure as it's also not handled
processFiles()
