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
    return text.replace(/"/g, '').replace(/,AP,/g, '').trim().replace(/,AP/g, '').trim()
}

fs.readdir(inputDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err)
        return
    }

    const csvFiles = files.filter(file => path.extname(file) === '.csv')

    csvFiles.forEach((fileName, index) => {
        fs.readFile(`${inputDir}/${fileName}`, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', fileName, err)
                return
            }

            data = removeUnnecessaryText(data)

            const parsedData = parse(data)

            parsedData.data.forEach(row => {
                row[7] = swapDateFormat(row[7])
            })

            const outputText = unparse(parsedData)

            let timestamp = moment().format('YYYYMMDDHHmmss')
            let outputFileName = `FFC_Manual_Batch_SFI_${timestamp}.csv`
            let outputPath = path.join(outputDir, outputFileName)

            let count = 1
            while (fs.existsSync(outputPath)) {
                timestamp = moment().add(count, 'seconds').format('YYYYMMDDHHmmss')
                outputFileName = `FFC_Manual_Batch_SFI_${timestamp}.csv`
                outputPath = path.join(outputDir, outputFileName)
                count++
            }

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
