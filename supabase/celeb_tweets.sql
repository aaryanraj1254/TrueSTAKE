-- Create celeb_tweets table
CREATE TABLE IF NOT EXISTS celeb_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celeb_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  tweet_text TEXT NOT NULL,
  tweet_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  impressions INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  market_status TEXT DEFAULT 'open', -- 'open', 'resolved_yes', 'resolved_no'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_celeb_tweets_handle ON celeb_tweets(handle);
CREATE INDEX IF NOT EXISTS idx_celeb_tweets_celeb_name ON celeb_tweets(celeb_name);
CREATE INDEX IF NOT EXISTS idx_celeb_tweets_posted_at ON celeb_tweets(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_celeb_tweets_market_status ON celeb_tweets(market_status);

-- RLS Policies
ALTER TABLE celeb_tweets ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read tweets
CREATE POLICY "Users can view celeb tweets" ON celeb_tweets
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow service role to insert/update tweets
CREATE POLICY "Service role can manage celeb tweets" ON celeb_tweets
  FOR ALL USING (auth.jwt() ->> 'service');

-- Allow anonymous users to read tweets for betting
CREATE POLICY "Anonymous users can view celeb tweets" ON celeb_tweets
  FOR SELECT USING (true);
