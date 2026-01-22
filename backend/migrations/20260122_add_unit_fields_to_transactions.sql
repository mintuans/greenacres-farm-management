-- Migration: Add unit Price and Quantity to Transactions
-- Description: Allows recording quantity and unit price for transactions (e.g., selling plums per kg)

ALTER TABLE transactions
ADD COLUMN quantity DECIMAL(15, 2),
ADD COLUMN unit VARCHAR(50),
ADD COLUMN unit_price DECIMAL(15, 2);

-- Update the view or functions if necessary.
-- The function get_transactions_by_month already returns t.* so it should be fine.
