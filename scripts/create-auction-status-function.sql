-- Create the get_auction_status function for AgentVault
CREATE OR REPLACE FUNCTION get_auction_status(auction_id UUID)
RETURNS TEXT AS $$
DECLARE
    current_time TIMESTAMP WITHOUT TIME ZONE := now();
    start_time TIMESTAMP WITHOUT TIME ZONE;
    end_time TIMESTAMP WITHOUT TIME ZONE;
BEGIN
    -- Get the start and end times of the auction
    SELECT start_at, end_at INTO start_time, end_time
    FROM agentvault_auctions
    WHERE id = auction_id;

    -- Check if the auction exists
    IF start_time IS NULL THEN
        RETURN 'invalid'; -- Auction not found
    END IF;

    -- Determine the status based on the current time
    IF current_time < start_time THEN
        RETURN 'pending'; -- Auction is scheduled for the future
    ELSIF current_time >= start_time AND current_time <= end_time THEN
        RETURN 'active';   -- Auction is currently active
    ELSIF current_time > end_time THEN
        RETURN 'completed'; -- Auction has ended
    ELSE
        RETURN 'unknown';  -- In case none of the above conditions are met
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_auction_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auction_status() TO anon;
