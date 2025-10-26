# Database Setup for Cricket Scoring App

## Overview

This app uses Supabase as the backend database. Each new match is created with `ongoing: true` by default, allowing you to track active matches separately from completed ones.

## Database Schema

### Tables

#### 1. `matches` table
Stores match information with automatic `ongoing: true` for new matches.

**Key fields:**
- `id` - UUID primary key
- `match_date` - Date of the match
- `team_a_name`, `team_b_name` - Team names
- `ongoing` - Boolean (always `true` for new matches)
- `status` - Match status (upcoming, live, completed, cancelled)
- `created_by` - References the user who created the match
- Score tracking fields for both teams

#### 2. `players` table  
Stores player information linked to matches.

**Key fields:**
- `match_id` - Links to the matches table
- `team` - 'A' or 'B' 
- `name` - Player name
- `player_number` - Player position (1, 2, 3, etc.)
- Stats fields (runs, balls faced, etc.)

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the content from `/database/schema.sql`
4. Click **Run** to execute the schema

### 3. Configure Environment Variables
Create or update your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Features Enabled

✅ **Row Level Security (RLS)** - Users can only access their own matches
✅ **Automatic Timestamps** - Created/updated timestamps managed automatically  
✅ **Data Validation** - Constraints on team values, status, etc.
✅ **Ongoing Match Tracking** - All new matches start with `ongoing: true`

## API Usage

### Create a New Match

```typescript
import { MatchService } from './lib/matchService'

const matchData = {
  match_date: new Date(),
  team_a_name: "Team A",
  team_b_name: "Team B", 
  team_a_players: [{ name: "Player 1" }, { name: "Player 2" }],
  team_b_players: [{ name: "Player 1" }, { name: "Player 2" }]
}

const result = await MatchService.createMatch(matchData)
// New match will have ongoing: true automatically
```

### Get Ongoing Matches

```typescript
const result = await MatchService.getOngoingMatches()
// Returns only matches where ongoing: true
```

### Update Match Status

```typescript
// Mark match as completed
await MatchService.updateMatchStatus(matchId, false, 'completed')

// Mark match as live 
await MatchService.updateMatchStatus(matchId, true, 'live')
```

## Security

- **Authentication Required** - All operations require user login
- **User Isolation** - Users can only access their own matches and players
- **Input Validation** - Server-side validation for all data
- **Type Safety** - Full TypeScript support with generated types

## Database Relationships

```
Users (Supabase Auth)
  ↓ (one-to-many)
Matches (ongoing: true by default)
  ↓ (one-to-many)  
Players (linked to match teams)
```

The `ongoing` field allows you to:
- List active matches separate from completed ones
- Resume scoring for matches in progress
- Track match lifecycle (upcoming → live → completed)
- Filter dashboard views by match status