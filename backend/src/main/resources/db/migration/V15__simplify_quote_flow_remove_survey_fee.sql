-- V15: Simplify quote flow and remove survey fee columns

ALTER TABLE orders
    DROP COLUMN IF EXISTS agreed_survey_fee,
    DROP COLUMN IF EXISTS applied_survey_fee,
    DROP COLUMN IF EXISTS waive_survey_if_repaired;

ALTER TABLE order_requests
    DROP COLUMN IF EXISTS survey_fee,
    DROP COLUMN IF EXISTS waive_survey_if_repaired;

ALTER TABLE order_quote_versions
    DROP COLUMN IF EXISTS survey_fee,
    DROP COLUMN IF EXISTS waive_survey_if_repaired;
