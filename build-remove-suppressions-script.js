const fs = require('fs')
const path = require('path')

const inputDir = path.join(__dirname, 'input')
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir)
}

const outputDir = path.join(__dirname, 'output')
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
}

const generateSqlForCsv = (csvFilePath) => {
  const data = fs.readFileSync(csvFilePath, 'utf8')
  const lines = data.split('\n')
  let sqlStatements = ''

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line) {
      const columns = line.split(',')
      const frn = columns[0].trim()
      const agreementNumber = columns[1].trim()
      const sql = `DELETE FROM public."frnAgreementClosed" WHERE frn = '${frn}' AND "agreementNumber" = '${agreementNumber}';\n`
      sqlStatements += sql
    }
  }

  return sqlStatements
}

// Function to process all CSV files in a directory
const processCsvFiles = () => {
  fs.readdir(inputDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      return
    }

    files.forEach(file => {
      if (file.endsWith('.csv')) {
        const csvFilePath = path.join(inputDir, file)
        const sql = generateSqlForCsv(csvFilePath)
        const sqlFilePath = path.join(outputDir, file.replace('.csv', '.sql'))

        fs.writeFile(sqlFilePath, sql, err => {
          if (err) {
            console.error('Error writing SQL file:', err)
          } else {
            console.log(`SQL file saved: ${sqlFilePath}`)
          }
        })
      }
    })
  })
}

processCsvFiles()
