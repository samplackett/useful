const fs = require('fs')
const path = require('path')

const inputFolder = './input'
const outputFolder = './output'

const processFile = (inputFilePath, outputFilePath) => {
    const data = fs.readFileSync(inputFilePath, 'utf8').trim().split('\n')
    const processedEntries = new Set()
    const formattedData = data.map(line => {
        const [paymentRequestId,schemeId,sourceSystem,deliveryBody,invoiceNumber,frn,sbi,agreementNumber,contractNumber,currency,schedule,dueDate,value,received,marketingYear,paymentRequestNumber,ledger,debtType,recoveryDate,originalSettlementDate,referenceId,correlationId,batch,paymentType,pillar,exchangeRate,eventDate,vendor,trader,claimDate,originalInvoiceNumber,invoiceCorrectionReference,migrated,migrationId] = line.split(',')
        
        if (processedEntries.has(`${correlationId}-${frn}-${invoiceNumber}`)) {
            return null
        } else {
            processedEntries.add(`${correlationId}-${frn}-${invoiceNumber}`)
        }

        const otherMatch = data.filter(item => item.split(',')[21] === correlationId && item.split(',')[5] === frn && item.split(',')[15] === Number(paymentRequestNumber) - 1)

        let status
        if (debtType) {
            status = 'Waiting for ledger assignment'
        } else {
            status = 'Waiting for debt data'
        }
        const lastUpdated = received ?? null
        let revOrCap = null
        const dateParts = dueDate.split('/')
        const day = parseInt(dateParts[0], 10)
        const month = parseInt(dateParts[1], 10) - 1
        const yr = parseInt(dateParts[2], 10)
        const jsDate = new Date(yr, month, day)
        if (schemeId === 5) {
            const is01December = jsDate.getDate() === 1 && jsDate.getMonth() === 11
            const is01January2016 = jsDate.getDate() === 1 && jsDate.getMonth() === 0 && jsDate.getFullYear() === 2016
            if (is01December || is01January2016) {
                revOrCap = 'Revenue'
            } else {
                revOrCap = 'Capital'
            }
        }
        let year = marketingYear
        if (schemeId === 5 && revOrCap === 'Revenue') {
            year = jsDate.getFullYear()
        }
        const routedToRequestEditor = debtType && debtType !== 'NULL' ? 'Y' : 'N'
        let deltaAmount = Number(value)
        if (otherMatch[0]) {
            deltaAmount -= Number(otherMatch[0].split(',')[12])
        }
        const enriched = debtType && debtType !== 'NULL' ? 'Y' : 'N'
            return `      (${correlationId && correlationId !== 'NULL' ? `'${correlationId}'` : null}, ${frn && frn !== 'NULL' ? frn : null}, ${contractNumber && contractNumber !== 'NULL' ? `'${contractNumber}'` : null}, ${agreementNumber && agreementNumber !== 'NULL' ? `'${agreementNumber}'` : null}, ${marketingYear && marketingYear !== 'NULL' ? marketingYear : null}, null, ${invoiceNumber && invoiceNumber !== 'NULL' ? `'${invoiceNumber}'` : null}, ${currency && currency !== 'NULL' ? `'${currency}'` : null}, ${paymentRequestNumber && paymentRequestNumber !== 'NULL' ? paymentRequestNumber : null}, ${(value || value === 0) && value !== 'NULL' ? `${value}` : null}, ${batch && batch !== 'NULL' ? `'${batch}'` : null}, ${sourceSystem && sourceSystem !== 'NULL' ? `'${sourceSystem}'` : null}, ${null}, ${status !== 'NULL' ? `'${status}'` : null}, ${lastUpdated && lastUpdated !== 'NULL' ? `'${lastUpdated}'` : null}, ${revOrCap && revOrCap !== 'NULL' ? `'${revOrCap}'` : null}, ${year && year !== 'NULL' ? year : null}, ${routedToRequestEditor && routedToRequestEditor !== 'NULL' ? `'${routedToRequestEditor}'` : null}, ${deltaAmount && deltaAmount !== 'NULL' ? deltaAmount : null}, ${null}, ${null}, ${debtType && debtType !== 'NULL' ? `'${debtType}'` : null}, ${null}, 'N', ${null}, ${null}, ${null}, ${null}, ${enriched && enriched !== 'NULL' ? `'${enriched}'` : null}, ${null}, ${null})`
    }).filter(Boolean).join(',\n')
    const sqlScript = `CREATE TABLE temp_pr_values (
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
    );

    INSERT INTO temp_pr_values (
        CorrelationId,
        FRN,
        ClaimNumber,
        AgreementNumber,
        MarketingYear,
        OriginalInvoiceNumber,
        InvoiceNumber,
        Currency,
        PaymentRequestNumber,
        Value,
        Batch,
        SourceSystem,
        BatchExportDate,
        Status,
        LastUpdated,
        RevenueOrCapital,
        Year,
        RoutedToRequestEditor,
        DeltaAmount,
        APValue,
        ARValue,
        DebtType,
        DAXFileName,
        DAXImported,
        SettledValue,
        PHError,
        DAXError,
        ReceivedInRequestEditor,
        Enriched,
        LedgerSplit,
        ReleasedFromRequestEditor
    )
    VALUES
${formattedData};`

    
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
            if (file.startsWith('pr-') && file.endsWith('.csv')) {
                const inputFilePath = path.join(inputFolder, file)
                const outputFilePath = path.join(outputFolder, file.replace('.csv', '.sql'))
                processFile(inputFilePath, outputFilePath)
            }
        })
    })
}

processFiles()
