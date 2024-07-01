const fs = require('fs')
const path = require('path')

const inputFolder = './input'
const outputFolder = './output'

const processFile = (inputFilePath, outputFilePath) => {
    const data = fs.readFileSync(inputFilePath, 'utf8').trim().split('\n')
    const formattedData = data.map(line => {
        const [referenceType, reference, frn] = line.split(',')
        return `      ('${referenceType}', '${reference}', '${frn.trim()}')`
    }).join(',\n')

    const sqlScript = `TRUNCATE customers RESTART IDENTITY;
    INSERT INTO public."customers"
      ("referenceType", "reference", "frn")
    VALUES
${formattedData}`

    fs.writeFileSync(outputFilePath, sqlScript)
    console.log(`File saved: ${outputFilePath}`)
}

const processFiles = () => {
    fs.readdir(inputFolder, (err, files) => {
        if (err) {
            console.error('Error reading input folder:', err)
            return
        }

        files.forEach(file => {
            if (file.startsWith('updated-customers_') && file.endsWith('.csv')) {
                const inputFilePath = path.join(inputFolder, file)
                const outputFilePath = path.join(outputFolder, file.replace('.csv', '.sql'))
                processFile(inputFilePath, outputFilePath)
            }
        })
    })
}

processFiles()
