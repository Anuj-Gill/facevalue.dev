-- ============================================
-- RLS POLICIES FOR Face Value
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS
-- ============================================
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all users"
ON users FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ORDERS
-- ============================================
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own orders"
ON orders FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all orders"
ON orders FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- TRADES
-- ============================================
CREATE POLICY "Users can view own trades"
ON trades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = trades.buy_order_id 
    AND orders.user_id = auth.uid()::text
  )
  OR
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = trades.sell_order_id 
    AND orders.user_id = auth.uid()::text
  )
);

CREATE POLICY "Service role can manage trades"
ON trades FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- SYMBOLS
-- ============================================
CREATE POLICY "Anyone can view symbols"
ON symbols FOR SELECT
USING (true);

CREATE POLICY "Service role can manage symbols"
ON symbols FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- HOLDINGS
-- ============================================
CREATE POLICY "Users can view own holdings"
ON holdings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage holdings"
ON holdings FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- COIN SUGGESTIONS
-- ============================================
CREATE POLICY "Authenticated users can view suggestions"
ON coin_suggestions FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create suggestions"
ON coin_suggestions FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = user_id
);

CREATE POLICY "Users can delete own suggestions"
ON coin_suggestions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage suggestions"
ON coin_suggestions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- COIN VOTES
-- ============================================
CREATE POLICY "Authenticated users can view votes"
ON coin_votes FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can vote"
ON coin_votes FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = user_id
);

CREATE POLICY "Users can update own votes"
ON coin_votes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
ON coin_votes FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage votes"
ON coin_votes FOR ALL
USING (auth.jwt()->>'role' = 'service_role');