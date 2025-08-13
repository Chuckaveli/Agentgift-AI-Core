-- Create the get_auction_status function that's missing
CREATE OR REPLACE FUNCTION public.get_auction_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    -- Return mock auction status data
    SELECT json_build_object(
        'is_live', true,
        'phase', 'active',
        'season', '2024-winter',
        'time_remaining', '2 days 14 hours',
        'next_auction', (NOW() + INTERVAL '7 days')::timestamp,
        'total_participants', 23,
        'active_items', 8,
        'total_bids', 47
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_auction_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auction_status() TO anon;
