INSERT INTO public."reportData"
    ("correlationId", "frn", "claimNumber", "agreementNumber", "marketingYear", "originalInvoiceNumber", "invoiceNumber", "currency", "paymentRequestNumber", "value", "batch", "sourceSystem", "batchExportDate", "status", "lastUpdated", "revenueOrCapital", "year", "routedToRequestEditor", "deltaAmount", "apValue", "arValue", "debtType", "daxFileName", "daxImported", "settledValue", "phError", "daxError", "receivedInRequestEditor", "enriched", "ledgerSplit", "releasedFromRequestEditor")
SELECT 
    CorrelationId, FRN, ClaimNumber, AgreementNumber, MarketingYear, OriginalInvoiceNumber, InvoiceNumber, Currency, PaymentRequestNumber, Value, Batch, SourceSystem, BatchExportDate, Status, LastUpdated, RevenueOrCapital, Year, RoutedToRequestEditor, DeltaAmount, APValue, ARValue, DebtType, DAXFileName, DAXImported, SettledValue, PHError, DAXError, ReceivedInRequestEditor, Enriched, LedgerSplit, ReleasedFromRequestEditor
FROM 
    temp_cpr_values
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM public."reportData" 
        WHERE "correlationId" = temp_cpr_values.CorrelationId 
        AND frn = temp_cpr_values.FRN 
        AND "invoiceNumber" = temp_cpr_values.InvoiceNumber
    );

DROP TABLE IF EXISTS temp_cpr_values;