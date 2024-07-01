const fs = require('fs')
const path = require('path')
const { parse, unparse } = require('papaparse')
const moment = require('moment')

const inputDir = path.join(__dirname, 'input')
if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir)
}

const outputDir = path.join(__dirname, 'output')
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
}

const swapDateFormat = (date) => {
    if (!date) return ''
    if (/\d{4}-\d{2}-\d{2}/.test(date)) return date
    var parts = date.split('/')
    var month = parts[1].length === 1 ? '0' + parts[1] : parts[1]
    var day = parts[0].length === 1 ? '0' + parts[0] : parts[0]
    return parts[2] + '-' + month + '-' + day
}

const removeUnnecessaryText = (text) => {
    return text.replace(/"/g, '').trim()
}

const removeTrailingCommas = (text) => {
    return text.split('\n').map(line => line.replace(/(,+)$/g, '')).join('\n')
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err)
        return
    }

    const filesToProcess = files.filter(file => path.extname(file) === '.csv' || path.extname(file) === '.txt')
    let timestamp = moment().format('YYYYMMDDHHmmss')

    filesToProcess.forEach((fileName, index) => {
        fs.readFile(`${inputDir}/${fileName}`, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', fileName, err)
                return
            }

            data = removeUnnecessaryText(data)
            data = removeTrailingCommas(data)
            const parsedData = parse(data, { header: false })

            parsedData.data.forEach(row => {
                row[7] = swapDateFormat(row[7])
            })

            let outputText = unparse(parsedData)
            outputText = removeTrailingCommas(outputText)

            if (index.toString().length === 1) {
                index = '0' + index
            }
            timestamp = timestamp.slice(0, -index.toString().length) + index
            let outputFileName = `FFC_Manual_Batch_SFI23_${timestamp}.csv`
            let outputPath = path.join(outputDir, outputFileName)

            fs.writeFile(outputPath, outputText, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing output file:', outputPath, err)
                    return
                }
                console.log(`File saved successfully: ${outputPath}`)
            })
        })
    })
})
