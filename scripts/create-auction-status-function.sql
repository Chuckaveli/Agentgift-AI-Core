-- Create the get_auction_status function for AgentVault
CREATE OR REPLACE FUNCTION get_auction_status()
RETURNS TABLE (
  total_items INTEGER,
  active_auctions INTEGER,
  total_bids INTEGER,
  highest_bid DECIMAL,
  ending_soon INTEGER
) AS $$
BEGIN
  -- Return mock data for now - replace with real queries when tables exist
  RETURN QUERY SELECT 
    25 as total_items,
    8 as active_auctions,
    156 as total_bids,
    89.99::DECIMAL as highest_bid,
    3 as ending_soon;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_auction_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auction_status() TO anon;
