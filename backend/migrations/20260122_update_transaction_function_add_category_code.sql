-- Migration: Update get_transactions_by_month function to include category_code
-- This allows the frontend to identify seed/plant transactions (GCT) for special display

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_transactions_by_month(integer, integer, uuid);

-- Recreate with category_code
CREATE OR REPLACE FUNCTION get_transactions_by_month(
    p_month integer,
    p_year integer,
    p_season_id uuid default null
)
RETURNS TABLE (
    id uuid,
    partner_id uuid,
    season_id uuid,
    category_id uuid,
    amount numeric,
    paid_amount numeric,
    type varchar,
    transaction_date timestamp with time zone,
    note text,
    is_inventory_affected boolean,
    quantity numeric,
    unit varchar,
    unit_price numeric,
    partner_name varchar,
    category_name varchar,
    category_code varchar,
    season_name varchar
) AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.partner_id, t.season_id, t.category_id, t.amount, t.paid_amount, 
           t.type::varchar, t.transaction_date, t.note, t.is_inventory_affected,
           t.quantity, t.unit, t.unit_price,
           p.partner_name, c.category_name, c.category_code, s.season_name
    FROM transactions t
    LEFT JOIN partners p ON t.partner_id = p.id
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN seasons s ON t.season_id = s.id
    WHERE EXTRACT(MONTH FROM t.transaction_date) = p_month
      AND EXTRACT(YEAR FROM t.transaction_date) = p_year
      AND (p_season_id IS NULL OR t.season_id = p_season_id)
    ORDER BY t.transaction_date DESC;
END;
$$ LANGUAGE plpgsql;
