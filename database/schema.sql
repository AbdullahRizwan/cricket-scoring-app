-- Cricket Scoring App Database Schema

-- Matches table to store match information
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Match details
    match_date DATE NOT NULL,
    team_a_name TEXT NOT NULL,
    team_b_name TEXT NOT NULL,
    ongoing BOOLEAN DEFAULT true NOT NULL,
    
    -- Match status
    status TEXT CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')) DEFAULT 'upcoming',
    
    -- User who created the match
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Optional match metadata
    venue TEXT,
    match_type TEXT DEFAULT 'friendly',
    overs INTEGER DEFAULT 20,
    
    -- Scores (will be updated during the match)
    team_a_score INTEGER DEFAULT 0,
    team_a_wickets INTEGER DEFAULT 0,
    team_a_overs_played DECIMAL(3,1) DEFAULT 0.0,
    
    team_b_score INTEGER DEFAULT 0,
    team_b_wickets INTEGER DEFAULT 0,
    team_b_overs_played DECIMAL(3,1) DEFAULT 0.0
);

-- Players table to store player information
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Player details
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    team TEXT CHECK (team IN ('A', 'B')) NOT NULL,
    name TEXT NOT NULL,
    player_number INTEGER NOT NULL,
    
    -- Player stats (will be updated during the match)
    runs_scored INTEGER DEFAULT 0,
    balls_faced INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    is_out BOOLEAN DEFAULT false,
    dismissal_type TEXT,
    
    UNIQUE(match_id, team, player_number)
);

-- Indexes for better performance
CREATE INDEX idx_matches_created_by ON matches(created_by);
CREATE INDEX idx_matches_ongoing ON matches(ongoing);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_players_match_id ON players(match_id);
CREATE INDEX idx_players_team ON players(team);

-- RLS (Row Level Security) policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Users can only see their own matches
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (auth.uid() = created_by);

-- Users can only create matches for themselves
CREATE POLICY "Users can create their own matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can only update their own matches
CREATE POLICY "Users can update their own matches" ON matches
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can only delete their own matches
CREATE POLICY "Users can delete their own matches" ON matches
    FOR DELETE USING (auth.uid() = created_by);

-- Players policies (linked to match ownership)
CREATE POLICY "Users can view players from their matches" ON players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = players.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create players for their matches" ON players
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = players.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update players from their matches" ON players
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = players.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete players from their matches" ON players
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = players.match_id 
            AND matches.created_by = auth.uid()
        )
    );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();