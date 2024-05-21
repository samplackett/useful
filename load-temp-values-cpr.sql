DO $$
DECLARE
    v_Row temp_cpr_values%ROWTYPE;
    v_CorrelationId VARCHAR(36);
    v_FRN BIGINT;
    v_InvoiceNumber VARCHAR(30);
BEGIN
    FOR v_Row IN SELECT * FROM temp_cpr_values LOOP
        v_CorrelationId := v_Row.CorrelationId;
        v_FRN := v_Row.FRN;
        v_InvoiceNumber := v_Row.InvoiceNumber;

        IF NOT EXISTS (
            SELECT 1 
            FROM public."reportData" 
            WHERE "correlationId" = v_CorrelationId 
            AND frn = v_FRN 
            AND "invoiceNumber" = v_InvoiceNumber
        ) THEN
            INSERT INTO public."reportData"
                ("correlationId", "frn", "claimNumber", "agreementNumber", "marketingYear", "originalInvoiceNumber", "invoiceNumber", "currency", "paymentRequestNumber", "value", "batch", "sourceSystem", "batchExportDate", "status", "lastUpdated", "revenueOrCapital", "year", "routedToRequestEditor", "deltaAmount", "apValue", "arValue", "debtType", "daxFileName", "daxImported", "settledValue", "phError", "daxError", "receivedInRequestEditor", "enriched", "ledgerSplit", "releasedFromRequestEditor")
            VALUES
                (v_Row.CorrelationId, v_Row.FRN, v_Row.ClaimNumber, v_Row.AgreementNumber, v_Row.MarketingYear, v_Row.OriginalInvoiceNumber, v_Row.InvoiceNumber, v_Row.Currency, v_Row.PaymentRequestNumber, v_Row.Value, v_Row.Batch, v_Row.SourceSystem, v_Row.BatchExportDate, v_Row.Status, v_Row.LastUpdated, v_Row.RevenueOrCapital, v_Row.Year, v_Row.RoutedToRequestEditor, v_Row.DeltaAmount, v_Row.APValue, v_Row.ARValue, v_Row.DebtType, v_Row.DAXFileName, v_Row.DAXImported, v_Row.SettledValue, v_Row.PHError, v_Row.DAXError, v_Row.ReceivedInRequestEditor, v_Row.Enriched, v_Row.LedgerSplit, v_Row.ReleasedFromRequestEditor);
        END IF;
    END LOOP;

    DROP TABLE IF EXISTS temp_cpr_values;
END $$;
