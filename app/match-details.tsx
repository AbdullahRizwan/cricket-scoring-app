import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, Divider, Text, useTheme } from 'react-native-paper';
import { MatchService } from '../lib/matchService';
import { getBattingStats, getBowlingStats, getTeamExtras } from './match-details-utils';

interface Player {
  name: string;
  team: string;
}

interface BattingStat {
  name: string;
  runs: number;
  balls: number;
  outBy?: string;
}

interface BowlingStat {
  name: string;
  runsGiven: number;
  wickets: number;
  balls: number;
}

export default function MatchDetailsScreen() {
  const theme = useTheme();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [balls, setBalls] = useState<any[]>([]);
  const [savedStats, setSavedStats] = useState<any>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      setLoading(true);
      setError(null);
      const result = await MatchService.getMatchWithPlayers(matchId!);
      if (result.success && result.match) {
        setMatch(result.match);
        setPlayers([...(result.teamAPlayers || []), ...(result.teamBPlayers || [])]);
        // Try to get stats from match object
        if (result.match.venue && result.match.venue.startsWith('{')) {
          const parsed = JSON.parse(result.match.venue);
          if (parsed.type === 'stats') {
            setSavedStats(parsed.data);
            setBalls([]);
          } else if (parsed.type === 'ballHistory') {
            setBalls(parsed.data);
            setSavedStats(null);
          } else {
            setBalls((result.match as any).ballHistory || []);
            setSavedStats(null);
          }
        } else {
          setBalls((result.match as any).ballHistory || []);
          setSavedStats(null);
        }
      } else {
        setError(result.error || 'Failed to fetch match details');
      }
      setLoading(false);
    };
    if (matchId) fetchMatchDetails();
  }, [matchId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator animating size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{error}</Text>
        ) : (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {match.team_a_name} vs {match.team_b_name}
                </Text>
                <Divider style={{ marginVertical: 8 }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Date: {match.match_date}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Type: {match.match_type || 'Friendly'}
                </Text>
              </Card.Content>
            </Card>
            {/* Team A Batting */}
            <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 12 }}>{match.team_a_name} Batting</Text>
            <View style={{ marginBottom: 16 }}>
            {(savedStats ? savedStats.teamA.batting : getBattingStats(players, balls, 'A')).map((player: BattingStat) => (
              <Card key={player.name} style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="titleSmall">{player.name}</Text>
                  <Text variant="bodyMedium">Runs: {player.runs}</Text>
                  <Text variant="bodyMedium">Balls Faced: {player.balls}</Text>
                  <Text variant="bodyMedium">Out By: {player.outBy || '-'}</Text>
                </Card.Content>
              </Card>
            ))}
            <Card style={{ marginBottom: 8 }}>
              <Card.Content>
                <Text variant="bodyMedium">Extras: {savedStats ? savedStats.teamA.extras : getTeamExtras(balls, players.filter(p => p.team === 'A'))}</Text>
              </Card.Content>
            </Card>
            </View>
            {/* Team A Bowling */}
            <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 12 }}>{match.team_a_name} Bowling</Text>
            <View style={{ marginBottom: 16 }}>
            {(savedStats ? savedStats.teamA.bowling : getBowlingStats(players, balls, 'A')).map((player: BowlingStat) => (
              <Card key={player.name} style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="titleSmall">{player.name}</Text>
                  <Text variant="bodyMedium">Runs Given: {player.runsGiven}</Text>
                  <Text variant="bodyMedium">Wickets: {player.wickets}</Text>
                  <Text variant="bodyMedium">Balls Bowled: {player.balls}</Text>
                </Card.Content>
              </Card>
            ))}
            </View>
            {/* Team B Batting */}
            <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 12 }}>{match.team_b_name} Batting</Text>
            <View style={{ marginBottom: 16 }}>
            {(savedStats ? savedStats.teamB.batting : getBattingStats(players, balls, 'B')).map((player: BattingStat) => (
              <Card key={player.name} style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="titleSmall">{player.name}</Text>
                  <Text variant="bodyMedium">Runs: {player.runs}</Text>
                  <Text variant="bodyMedium">Balls Faced: {player.balls}</Text>
                  <Text variant="bodyMedium">Out By: {player.outBy || '-'}</Text>
                </Card.Content>
              </Card>
            ))}
            <Card style={{ marginBottom: 8 }}>
              <Card.Content>
                <Text variant="bodyMedium">Extras: {savedStats ? savedStats.teamB.extras : getTeamExtras(balls, players.filter(p => p.team === 'B'))}</Text>
              </Card.Content>
            </Card>
            </View>
            {/* Team B Bowling */}
            <Text variant="titleMedium" style={{ marginTop: 24, marginBottom: 12 }}>{match.team_b_name} Bowling</Text>
            <View style={{ marginBottom: 16 }}>
            {(savedStats ? savedStats.teamB.bowling : getBowlingStats(players, balls, 'B')).map((player: BowlingStat) => (
              <Card key={player.name} style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="titleSmall">{player.name}</Text>
                  <Text variant="bodyMedium">Runs Given: {player.runsGiven}</Text>
                  <Text variant="bodyMedium">Wickets: {player.wickets}</Text>
                  <Text variant="bodyMedium">Balls Bowled: {player.balls}</Text>
                </Card.Content>
              </Card>
            ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
