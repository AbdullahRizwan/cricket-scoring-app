-- Additional tables for comprehensive cricket scoring
-- Run this after your existing schema.sql

-- Innings table to track each innings
CREATE TABLE innings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    innings_number INTEGER NOT NULL CHECK (innings_number IN (1, 2)),
    batting_team TEXT NOT NULL CHECK (batting_team IN ('A', 'B')),
    bowling_team TEXT NOT NULL CHECK (bowling_team IN ('A', 'B')),
    
    -- Innings totals
    total_runs INTEGER DEFAULT 0,
    total_wickets INTEGER DEFAULT 0,
    total_overs INTEGER DEFAULT 0,
    total_balls INTEGER DEFAULT 0,
    
    -- Innings status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(match_id, innings_number)
);

-- Balls table to store ball-by-ball data
CREATE TABLE balls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    innings_id UUID REFERENCES innings(id) ON DELETE CASCADE NOT NULL,
    
    -- Ball identification
    over_number INTEGER NOT NULL,
    ball_number INTEGER NOT NULL, -- 1-6 for normal balls
    
    -- Players involved
    striker_id UUID REFERENCES players(id) NOT NULL,
    non_striker_id UUID REFERENCES players(id),
    bowler_id UUID REFERENCES players(id) NOT NULL,
    
    -- Ball outcome
    runs INTEGER DEFAULT 0,
    extras TEXT CHECK (extras IN ('none', 'wide', 'no-ball', 'bye', 'leg-bye')) DEFAULT 'none',
    is_wicket BOOLEAN DEFAULT false,
    
    -- Wicket details (if applicable)
    dismissal_type TEXT CHECK (dismissal_type IN ('bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket')),
    fielder_id UUID REFERENCES players(id), -- for catches, run-outs, etc.
    
    -- Ball sequence
    ball_sequence INTEGER NOT NULL -- Overall ball number in innings
);

-- Player innings stats (detailed stats for each innings)
CREATE TABLE player_innings_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    innings_id UUID REFERENCES innings(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
    
    -- Batting stats
    runs_scored INTEGER DEFAULT 0,
    balls_faced INTEGER DEFAULT 0,
    fours INTEGER DEFAULT 0,
    sixes INTEGER DEFAULT 0,
    strike_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Dismissal info
    is_out BOOLEAN DEFAULT false,
    dismissal_type TEXT,
    dismissed_by UUID REFERENCES players(id), -- bowler who got the wicket
    fielder_id UUID REFERENCES players(id), -- fielder involved
    
    -- Bowling stats (if player bowled)
    overs_bowled DECIMAL(3,1) DEFAULT 0.0,
    runs_conceded INTEGER DEFAULT 0,
    wickets_taken INTEGER DEFAULT 0,
    economy_rate DECIMAL(4,2) DEFAULT 0.00,
    
    UNIQUE(match_id, innings_id, player_id)
);

-- Overs table to track over-by-over progress
CREATE TABLE overs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
    innings_id UUID REFERENCES innings(id) ON DELETE CASCADE NOT NULL,
    
    over_number INTEGER NOT NULL,
    bowler_id UUID REFERENCES players(id) NOT NULL,
    
    -- Over statistics
    runs_in_over INTEGER DEFAULT 0,
    wickets_in_over INTEGER DEFAULT 0,
    balls_bowled INTEGER DEFAULT 0, -- Usually 6, but can be less if over interrupted
    
    -- Running totals at end of over
    total_runs INTEGER DEFAULT 0,
    total_wickets INTEGER DEFAULT 0,
    
    is_completed BOOLEAN DEFAULT false,
    
    UNIQUE(match_id, innings_id, over_number)
);

-- Indexes for better performance
CREATE INDEX idx_innings_match_id ON innings(match_id);
CREATE INDEX idx_balls_match_id ON balls(match_id);
CREATE INDEX idx_balls_innings_id ON balls(innings_id);
CREATE INDEX idx_balls_over_ball ON balls(over_number, ball_number);
CREATE INDEX idx_player_innings_stats_match_id ON player_innings_stats(match_id);
CREATE INDEX idx_player_innings_stats_innings_id ON player_innings_stats(innings_id);
CREATE INDEX idx_overs_match_id ON overs(match_id);
CREATE INDEX idx_overs_innings_id ON overs(innings_id);

-- RLS policies for new tables
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE balls ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_innings_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE overs ENABLE ROW LEVEL SECURITY;

-- Innings policies
CREATE POLICY "Users can view innings from their matches" ON innings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = innings.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create innings for their matches" ON innings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = innings.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update innings from their matches" ON innings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = innings.match_id 
            AND matches.created_by = auth.uid()
        )
    );

-- Balls policies
CREATE POLICY "Users can view balls from their matches" ON balls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = balls.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create balls for their matches" ON balls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = balls.match_id 
            AND matches.created_by = auth.uid()
        )
    );

-- Player innings stats policies
CREATE POLICY "Users can view player stats from their matches" ON player_innings_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = player_innings_stats.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create player stats for their matches" ON player_innings_stats
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = player_innings_stats.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update player stats from their matches" ON player_innings_stats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = player_innings_stats.match_id 
            AND matches.created_by = auth.uid()
        )
    );

-- Overs policies
CREATE POLICY "Users can view overs from their matches" ON overs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = overs.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create overs for their matches" ON overs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = overs.match_id 
            AND matches.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update overs from their matches" ON overs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = overs.match_id 
            AND matches.created_by = auth.uid()
        )
    );