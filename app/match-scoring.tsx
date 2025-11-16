import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  Text,
  useTheme
} from 'react-native-paper'
import { Match, Player } from '../lib/database.types'
import { MatchService } from '../lib/matchService'
import { getBattingStats, getBowlingStats, getTeamExtras } from './match-details-utils'

interface Ball {
  id: string
  runs: number
  extras: 'none' | 'wide' | 'no-ball' | 'bye' | 'leg-bye'
  isWicket: boolean
  striker: string
  bowler: string
  over: number
  ball: number
}

interface TeamScore {
  runs: number
  wickets: number
  overs: number
  balls: number
}

export default function MatchScoringScreen() {
  const theme = useTheme()
  const { matchId, striker: initialStriker, nonStriker: initialNonStriker, bowler: initialBowler, battingTeam, innings: currentInnings, firstInningsScore } = useLocalSearchParams<{
    matchId: string
    striker: string
    nonStriker?: string
    bowler: string
    battingTeam: 'A' | 'B'
    innings?: string
    firstInningsScore?: string
  }>()
  
  const [match, setMatch] = useState<Match | null>(null)
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Match state
  const [currentBattingTeam, setCurrentBattingTeam] = useState<'A' | 'B'>(battingTeam || 'A')
  const [currentBowlingTeam, setCurrentBowlingTeam] = useState<'A' | 'B'>(battingTeam === 'A' ? 'B' : 'A')
  const [inning, setInning] = useState<1 | 2>(currentInnings === '2' ? 2 : 1)
  
  // Current players
  const [striker, setStriker] = useState<Player | null>(null)
  const [nonStriker, setNonStriker] = useState<Player | null>(null)
  const [bowler, setBowler] = useState<Player | null>(null)
  
  // Scores
  const [teamAScore, setTeamAScore] = useState<TeamScore>({ runs: 0, wickets: 0, overs: 0, balls: 0 })
  const [teamBScore, setTeamBScore] = useState<TeamScore>({ runs: 0, wickets: 0, overs: 0, balls: 0 })
  
  // Player stats
  const [playerStats, setPlayerStats] = useState<Record<string, { runs: number, balls: number }>>({})
  
  // Track players who are out
  const [outPlayers, setOutPlayers] = useState<Set<string>>(new Set())
  
  // Over management
  const [currentOver, setCurrentOver] = useState(1)
  const [currentBall, setCurrentBall] = useState(1)
  const [ballHistory, setBallHistory] = useState<Ball[]>([])
  
  // Dialogs
  const [bowlerSelectDialog, setBowlerSelectDialog] = useState(false)
  const [endInningsDialog, setEndInningsDialog] = useState(false)
  const [batsmanSelectDialog, setBatsmanSelectDialog] = useState(false)
  const [noBallDialog, setNoBallDialog] = useState(false)

  useEffect(() => {
    if (matchId) {
      loadMatchDetails()
    }
  }, [matchId])

  const loadMatchDetails = async () => {
    try {
      setIsLoading(true)
      const result = await MatchService.getMatchWithPlayers(matchId!)
      
      if (result.success && result.match) {
        setMatch(result.match)
        setTeamAPlayers(result.teamAPlayers || [])
        setTeamBPlayers(result.teamBPlayers || [])
        
        // Set initial players
        const allPlayers = [...(result.teamAPlayers || []), ...(result.teamBPlayers || [])]
        
        if (initialStriker) {
          const strikerPlayer = allPlayers.find(p => p.id === initialStriker)
          setStriker(strikerPlayer || null)
        }
        
        if (initialNonStriker) {
          const nonStrikerPlayer = allPlayers.find(p => p.id === initialNonStriker)
          setNonStriker(nonStrikerPlayer || null)
        }
        
        if (initialBowler) {
          const bowlerPlayer = allPlayers.find(p => p.id === initialBowler)
          setBowler(bowlerPlayer || null)
        }
        
      } else {
        Alert.alert('Error', result.error || 'Failed to load match details')
        router.back()
      }
    } catch (error) {
      console.error('Error loading match:', error)
      Alert.alert('Error', 'An unexpected error occurred')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  // Show winner popup if target achieved
  const completeMatchWithWinner = async (winnerName: string) => {
    try {
      // Calculate stats
      const allPlayers = [...teamAPlayers, ...teamBPlayers]
      const teamA = allPlayers.filter(p => p.team === 'A')
      const teamB = allPlayers.filter(p => p.team === 'B')
      const battingStatsA = getBattingStats(teamA, ballHistory, 'A')
      const battingStatsB = getBattingStats(teamB, ballHistory, 'B')
      const bowlingStatsA = getBowlingStats(teamA, ballHistory, 'A')
      const bowlingStatsB = getBowlingStats(teamB, ballHistory, 'B')
      const extrasA = getTeamExtras(ballHistory, teamA)
      const extrasB = getTeamExtras(ballHistory, teamB)

      const stats = {
        teamA: {
          batting: battingStatsA,
          bowling: bowlingStatsA,
          extras: extrasA
        },
        teamB: {
          batting: battingStatsB,
          bowling: bowlingStatsB,
          extras: extrasB
        }
      }

      await MatchService.updateMatchStatus(matchId!, false, 'completed', { 
        venue: JSON.stringify(stats),
        team_a_score: teamAScore.runs,
        team_a_wickets: teamAScore.wickets,
        team_a_overs_played: teamAScore.overs,
        team_b_score: teamBScore.runs,
        team_b_wickets: teamBScore.wickets,
        team_b_overs_played: teamBScore.overs
      })
      Alert.alert(
        'Match Complete!',
        `${winnerName} has won the match!\n\nFinal Score:\n${match?.team_a_name}: ${teamAScore.runs}/${teamAScore.wickets}\n${match?.team_b_name}: ${teamBScore.runs}/${teamBScore.wickets}`,
        [
          {
            text: 'Back to Home',
            onPress: () => router.replace('/(tabs)/home')
          }
        ]
      )
    } catch (error) {
      console.error('Error completing match:', error)
      Alert.alert('Error', 'Failed to complete match')
    }
  }

  const getCurrentBattingScore = () => {
    return currentBattingTeam === 'A' ? teamAScore : teamBScore
  }

  const setCurrentBattingScore = (score: TeamScore) => {
    if (currentBattingTeam === 'A') {
      setTeamAScore(score)
    } else {
      setTeamBScore(score)
    }
  }

  const getCurrentBattingPlayers = () => {
    return currentBattingTeam === 'A' ? teamAPlayers : teamBPlayers
  }

  const getCurrentBowlingPlayers = () => {
    return currentBowlingTeam === 'A' ? teamAPlayers : teamBPlayers
  }

  const recordBall = async (runs: number, extras: Ball['extras'] = 'none', isWicket: boolean = false) => {
    if (!striker || !bowler) return

    const newBall: Ball = {
      id: `${currentOver}-${currentBall}-${Date.now()}`,
      runs,
      extras,
      isWicket,
      striker: striker.id,
      bowler: bowler.id,
      over: currentOver,
      ball: currentBall
    }

    // Update ball history
    const newHistory = [...ballHistory, newBall];
    setBallHistory(newHistory);

    // Save to DB
    try {
      await MatchService.updateMatchStatus(matchId!, true, undefined, { venue: JSON.stringify({ type: 'ballHistory', data: newHistory }) });
    } catch (error) {
      console.error('Error saving ball to DB:', error);
    }


    // Update team score
    const currentScore = getCurrentBattingScore()
    let newRuns = currentScore.runs + runs
    let newWickets = currentScore.wickets + (isWicket ? 1 : 0)
    let newBalls = currentScore.balls
    let newOvers = currentScore.overs

    // Only increment ball count for normal balls (not wides or no-balls)
    if (extras !== 'wide' && extras !== 'no-ball') {
      newBalls += 1
      if (newBalls === 6) {
        newBalls = 0
        newOvers += 1
        setCurrentOver(prev => prev + 1)
        setCurrentBall(1)
        // Show bowler selection after over
        setBowlerSelectDialog(true)
      } else {
        setCurrentBall(prev => prev + 1)
      }
    }

    setCurrentBattingScore({
      runs: newRuns,
      wickets: newWickets,
      overs: newOvers,
      balls: newBalls
    })

    // Check for target achieved in second innings
    if (inning === 2 && firstInningsScore) {
      const target = parseInt(firstInningsScore.split('/')[0]) + 1
      if (newRuns >= target) {
        // End match and show winner popup
        const winner = currentBattingTeam === 'A' ? match?.team_a_name : match?.team_b_name
        completeMatchWithWinner(winner || (currentBattingTeam === 'A' ? 'Team A' : 'Team B'))
        return
      }
    }

    // Update player stats
    if (striker) {
      setPlayerStats(prev => ({
        ...prev,
        [striker.id]: {
          runs: (prev[striker.id]?.runs || 0) + (extras === 'none' || extras === 'no-ball' ? runs : 0),
          balls: (prev[striker.id]?.balls || 0) + (extras !== 'wide' && extras !== 'no-ball' ? 1 : 0)
        }
      }))
    }

    // Switch strike on odd runs (for normal balls) - only if both batsmen are present
    if (runs % 2 === 1 && extras === 'none' && !isWicket && nonStriker && striker) {
      const temp = striker
      setStriker(nonStriker)
      setNonStriker(temp)
    }

    // Handle wicket
    if (isWicket) {
      // Add the striker to out players list first
      if (striker) {
        setOutPlayers(prev => new Set([...prev, striker.id]))
      }

      // Check if team is all out (auto-end innings)
      const currentBattingPlayers = currentBattingTeam === 'A' ? teamAPlayers : teamBPlayers
      const totalPlayers = currentBattingPlayers.length
      
      // Calculate how many players are still available to bat (excluding the striker who just got out)
      const newOutPlayers = new Set([...outPlayers, striker.id])
      const availablePlayers = getCurrentBattingPlayers().filter(player => 
        !newOutPlayers.has(player.id)
      )
      
      console.log('🏏 WICKET DEBUG:')
      console.log('- Striker out:', striker?.name, striker?.id)
      console.log('- Non-striker:', nonStriker?.name, nonStriker?.id)
      console.log('- Available players after wicket:', availablePlayers.map(p => p.name))
      console.log('- Available count:', availablePlayers.length)
      console.log('- New wickets:', newWickets, 'Total players:', totalPlayers)

      // Check if innings should end (when only 1 or 0 players remain)
      if (availablePlayers.length <= 1) {
        // If exactly 1 player left and it's the current non-striker, they continue as last man
        if (availablePlayers.length === 1 && availablePlayers[0].id === nonStriker?.id) {
          console.log('🏏 Setting non-striker as last man')
          setStriker(nonStriker)
          setNonStriker(null)
          
          Alert.alert(
            'Last Man Batting',
            `${nonStriker?.name} is now the last batsman remaining.`,
            [{ text: 'Continue' }]
          )
        } else {
          // No viable players left - end innings
          console.log('🏏 No players left - ending innings')
          Alert.alert(
            'All Out!',
            `${currentBattingTeam === 'A' ? match?.team_a_name : match?.team_b_name} is all out! (${newWickets}/${totalPlayers - 1})\n\n${inning === 1 ? 'Starting second innings...' : 'Match completed!'}`,
            [{ 
              text: 'OK',
              onPress: () => endInnings()
            }]
          )
        }
      } else {
        // Multiple players available - show selection dialog
        console.log('🏏 Multiple players available - showing selection')
        showBatsmanSelection()
      }
    }
  }

  const handleWicket = () => {
    // Directly show batsman selection dialog
    showBatsmanSelection()
  }

  const showBatsmanSelection = () => {
    setBatsmanSelectDialog(true)
  }

  const redoLastBall = () => {
    if (ballHistory.length === 0) return

    const lastBall = ballHistory[ballHistory.length - 1]
    
    // Remove last ball from history
    setBallHistory(prev => prev.slice(0, -1))
    
    // Revert scores
    const currentScore = getCurrentBattingScore()
    let newRuns = currentScore.runs - lastBall.runs
    let newWickets = currentScore.wickets - (lastBall.isWicket ? 1 : 0)
    let newBalls = currentScore.balls
    let newOvers = currentScore.overs

    // Revert ball count
    if (lastBall.extras !== 'wide' && lastBall.extras !== 'no-ball') {
      if (currentBall === 1 && currentOver > 1) {
        setCurrentOver(prev => prev - 1)
        setCurrentBall(6)
        newBalls = 5
        newOvers -= 1
      } else {
        setCurrentBall(prev => prev - 1)
        newBalls -= 1
        if (newBalls < 0) newBalls = 0
      }
    }

    setCurrentBattingScore({
      runs: Math.max(0, newRuns),
      wickets: Math.max(0, newWickets),
      overs: Math.max(0, newOvers),
      balls: Math.max(0, newBalls)
    })

    // Revert player stats
    if (lastBall.striker) {
      setPlayerStats(prev => ({
        ...prev,
        [lastBall.striker]: {
          runs: Math.max(0, (prev[lastBall.striker]?.runs || 0) - (lastBall.extras === 'none' || lastBall.extras === 'no-ball' ? lastBall.runs : 0)),
          balls: Math.max(0, (prev[lastBall.striker]?.balls || 0) - (lastBall.extras !== 'wide' && lastBall.extras !== 'no-ball' ? 1 : 0))
        }
      }))
    }

    // If last ball was a wicket, remove player from out list
    if (lastBall.isWicket && lastBall.striker) {
      setOutPlayers(prev => {
        const newSet = new Set(prev)
        newSet.delete(lastBall.striker)
        return newSet
      })
    }
  }

  const endInnings = () => {
    setEndInningsDialog(false)
    
    if (inning === 1) {
      // Show innings complete dialog first
      console.log("debug: new ining player selection")
      Alert.alert(
        'First Innings Complete!',
        `${currentBattingTeam === 'A' ? match?.team_a_name : match?.team_b_name} scored ${getCurrentBattingScore().runs}/${getCurrentBattingScore().wickets}\n\nNow it's ${currentBattingTeam === 'A' ? match?.team_b_name : match?.team_a_name}'s turn to bat.`,
        [
          {
            text: 'Select Players for 2nd Innings',
            onPress: () => {
              // Navigate to match setup for second innings player selection
              router.push({
                pathname: '/match-setup',
                params: {
                  matchId: matchId!,
                  battingTeam: currentBattingTeam === 'A' ? 'B' : 'A',
                  innings: '2',
                  // Pass first innings score for context
                  firstInningsScore: `${getCurrentBattingScore().runs}/${getCurrentBattingScore().wickets}`
                }
              })
            }
          }
        ]
      )
    } else {
      // Match complete
      completeMatch()
    }
  }

  const completeMatch = async () => {
    try {
      await MatchService.updateMatchStatus(matchId!, false, 'completed')
      Alert.alert(
        'Match Complete!',
        `Final Score:\n${match?.team_a_name}: ${teamAScore.runs}/${teamAScore.wickets}\n${match?.team_b_name}: ${teamBScore.runs}/${teamBScore.wickets}`,
        [
          {
            text: 'Back to Home',
            onPress: () => router.replace('/(tabs)/home')
          }
        ]
      )
    } catch (error) {
      console.error('Error completing match:', error)
      Alert.alert('Error', 'Failed to complete match')
    }
  }

  const formatOvers = (overs: number, balls: number) => {
    return `${overs}.${balls}`
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground }}>
          Loading Match...
        </Text>
      </View>
    )
  }

  const currentScore = getCurrentBattingScore()

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            iconColor={theme.colors.onBackground}
          />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
              {match?.team_a_name} vs {match?.team_b_name}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Innings {inning} • {currentBattingTeam === 'A' ? match?.team_a_name : match?.team_b_name} Batting
            </Text>
          </View>
        </View>

        {/* First Innings Score Display (for second innings) */}
        {inning === 2 && firstInningsScore && (
          <Card style={{ marginBottom: 16, backgroundColor: theme.colors.secondaryContainer }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: theme.colors.onSecondaryContainer, textAlign: 'center' }}>
                First Innings: {firstInningsScore}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer, textAlign: 'center', marginTop: 4 }}>
                Target to win: {parseInt(firstInningsScore.split('/')[0]) + 1} runs
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Current Score */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="headlineLarge" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
              {currentScore.runs}-{currentScore.wickets} : {formatOvers(currentScore.overs, currentScore.balls)}
            </Text>
            <Divider style={{ marginVertical: 12 }} />
            
            {/* Batsmen Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Striker *
                </Text>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {striker?.name || 'Select Striker'}: {playerStats[striker?.id || '']?.runs || 0}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Non-Striker
                </Text>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {nonStriker?.name || 'None'}: {playerStats[nonStriker?.id || '']?.runs || 0}
                </Text>
              </View>
            </View>
            
            <Divider style={{ marginVertical: 12 }} />
            
            {/* Bowler */}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Bowler
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {bowler?.name || 'Select Bowler'}
            </Text>
          </Card.Content>
        </Card>

        {/* Scoring Buttons */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Score Runs
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 6].map(runs => (
                <Button
                  key={runs}
                  mode="outlined"
                  onPress={() => recordBall(runs)}
                  style={{ minWidth: 60 }}
                  disabled={!striker || !bowler}
                  buttonColor={runs === 4 || runs === 6 ? '#3f693fff' : undefined}
                  textColor={runs === 4 || runs === 6 ? 'white' : undefined}
                >
                  {runs}
                </Button>
              ))}
            </View>
            
            <Text variant="titleMedium" style={{ marginBottom: 12, color: theme.colors.onSurface }}>
              Extras & Events
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Button
                mode="outlined"
                onPress={() => setNoBallDialog(true)}
                disabled={!striker || !bowler}
              >
                No Ball
              </Button>
              <Button
                mode="outlined"
                onPress={() => recordBall(1, 'wide')}
                disabled={!striker || !bowler}
              >
                Wide
              </Button>
              <Button
                mode="outlined"
                onPress={() => recordBall(0, 'none', true)}
                disabled={!striker || !bowler}
                buttonColor={theme.colors.errorContainer}
              >
                Out
              </Button>
              <Button
                mode="outlined"
                onPress={redoLastBall}
                disabled={ballHistory.length === 0}
                icon="undo"
              >
                Redo Last Ball
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Match Controls */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          <Button
            mode="outlined"
            onPress={() => setEndInningsDialog(true)}
            style={{ flex: 1 }}
            icon="flag"
          >
            End Innings
          </Button>
        </View>

      </View>

      {/* Bowler Selection Dialog */}
      <Portal>
        <Dialog visible={bowlerSelectDialog} onDismiss={() => setBowlerSelectDialog(false)} dismissable={false}>
          <Dialog.Title>Over Complete - Select Next Bowler</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Choose the bowler for the next over:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {getCurrentBowlingPlayers().map((player) => (
                <Chip
                  key={player.id}
                  onPress={() => {
                    setBowler(player)
                    setBowlerSelectDialog(false)
                  }}
                  mode="outlined"
                >
                  {player.name}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* End Innings Dialog */}
      <Portal>
        <Dialog visible={endInningsDialog} onDismiss={() => setEndInningsDialog(false)} dismissable={false}>
          <Dialog.Title>End Innings</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {inning === 1 
                ? 'Are you sure you want to end the first innings and start the second innings?'
                : 'Are you sure you want to end the match? This will mark the match as completed.'
              }
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEndInningsDialog(false)}>Cancel</Button>
            <Button onPress={endInnings}>
              {inning === 1 ? 'Start 2nd Innings' : 'Complete Match'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Batsman Selection Dialog */}
      <Portal>
        <Dialog visible={batsmanSelectDialog} onDismiss={() => setBatsmanSelectDialog(false)} dismissable={false}>
          <Dialog.Title>Wicket! Select Next Batsman</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              {striker?.name} is out. Choose the next batsman:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(() => {
                const availablePlayers = getCurrentBattingPlayers()
                  .filter(player => 
                    player.id !== striker?.id && 
                    player.id !== nonStriker?.id &&
                    !outPlayers.has(player.id)
                  )
                
                if (availablePlayers.length === 0) {
                  return (
                    <Text variant="bodyMedium" style={{ fontStyle: 'italic', color: theme.colors.onSurfaceVariant }}>
                      No more players available - last man batting
                    </Text>
                  )
                }
                
                return availablePlayers.map((player) => (
                  <Chip
                    key={player.id}
                    onPress={() => {
                      setStriker(player)
                      setBatsmanSelectDialog(false)
                    }}
                    mode="outlined"
                  >
                    {player.name}
                  </Chip>
                ))
              })()}
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* No Ball Dialog */}
      <Portal>
        <Dialog visible={noBallDialog} onDismiss={() => setNoBallDialog(false)} dismissable={false}>
          <Dialog.Title>No Ball - Select Additional Runs</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              A no ball gives 1 extra run. Select additional runs scored by the batsman:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <Button
                  key={runs}
                  mode="outlined"
                  onPress={() => {
                    // No ball gives 1 extra + any runs scored by batsman
                    recordBall(1 + runs, 'no-ball')
                    setNoBallDialog(false)
                  }}
                  style={{ minWidth: 60 }}
                >
                  {runs === 0 ? 'Just No Ball (1)' : `${runs} + No Ball (${1 + runs})`}
                </Button>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNoBallDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  )
}