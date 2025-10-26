// React Native Paper Examples
// This file shows various Paper components you can use in your cricket scoring app

import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    Chip,
    Dialog,
    Divider,
    FAB,
    IconButton,
    List,
    Portal,
    ProgressBar,
    RadioButton,
    Snackbar,
    Surface,
    Switch,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper'

export default function PaperExamples() {
  const [text, setText] = useState('')
  const [switchValue, setSwitchValue] = useState(false)
  const [radioValue, setRadioValue] = useState('first')
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [dialogVisible, setDialogVisible] = useState(false)
  const theme = useTheme()

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        
        {/* Text Components */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Text Variants" />
          <Card.Content>
            <Text variant="displayLarge">Display Large</Text>
            <Text variant="headlineLarge">Headline Large</Text>
            <Text variant="titleLarge">Title Large</Text>
            <Text variant="bodyLarge">Body Large</Text>
            <Text variant="labelMedium">Label Medium</Text>
          </Card.Content>
        </Card>

        {/* Input Components */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Input Components" />
          <Card.Content>
            <TextInput
              label="Player Name"
              value={text}
              onChangeText={setText}
              mode="outlined"
              style={{ marginBottom: 8 }}
            />
            <TextInput
              label="Score"
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Icon icon="cricket" />}
            />
          </Card.Content>
        </Card>

        {/* Buttons */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Buttons" />
          <Card.Content>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <Button mode="contained">Contained</Button>
              <Button mode="outlined">Outlined</Button>
              <Button mode="text">Text</Button>
            </View>
            <Button mode="contained-tonal" icon="plus">
              Add Player
            </Button>
          </Card.Content>
        </Card>

        {/* Controls */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Controls" />
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text>Dark Mode</Text>
              <Switch
                value={switchValue}
                onValueChange={setSwitchValue}
                style={{ marginLeft: 'auto' }}
              />
            </View>
            
            <Text>Game Format:</Text>
            <RadioButton.Group
              onValueChange={setRadioValue}
              value={radioValue}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value="t20" />
                <Text>T20</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value="odi" />
                <Text>ODI</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value="test" />
                <Text>Test</Text>
              </View>
            </RadioButton.Group>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Checkbox
                status={checkboxValue ? 'checked' : 'unchecked'}
                onPress={() => setCheckboxValue(!checkboxValue)}
              />
              <Text>Include extras</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Chips and Avatar */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Chips & Avatar" />
          <Card.Content>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <Chip icon="account">Player 1</Chip>
              <Chip mode="outlined" onPress={() => console.log('Pressed')}>
                Bowler
              </Chip>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Avatar.Text size={40} label="MS" />
              <Badge>7</Badge>
              <Text>MS Dhoni</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Progress */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Progress Indicators" />
          <Card.Content>
            <Text>Match Progress</Text>
            <ProgressBar progress={0.7} color={theme.colors.primary} />
          </Card.Content>
        </Card>

        {/* List */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Lists" />
          <Card.Content>
            <List.Item
              title="Current Match"
              description="Team A vs Team B"
              left={(props) => <List.Icon {...props} icon="cricket" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Statistics"
              description="View match statistics"
              left={(props) => <List.Icon {...props} icon="chart-bar" />}
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 }}>
          <IconButton
            icon="plus"
            mode="contained"
            onPress={() => console.log('Add')}
          />
          <IconButton
            icon="delete"
            mode="contained"
            iconColor={theme.colors.error}
            onPress={() => setSnackbarVisible(true)}
          />
          <IconButton
            icon="settings"
            mode="outlined"
            onPress={() => setDialogVisible(true)}
          />
        </View>

        {/* Surface */}
        <Surface style={{ padding: 16, marginBottom: 16, borderRadius: 8 }} elevation={2}>
          <Text variant="titleMedium">Cricket Score Card</Text>
          <Text>Team A: 180/4 (18.2 overs)</Text>
          <Text>Team B: 95/2 (12 overs)</Text>
        </Surface>

        <FAB
          icon="plus"
          style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
          onPress={() => console.log('FAB Pressed')}
        />
      </View>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Undo',
          onPress: () => console.log('Undo pressed'),
        }}
      >
        Player deleted successfully
      </Snackbar>

      {/* Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Match Settings</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Configure your match settings here.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => setDialogVisible(false)}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  )
}