import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from '@/components/ScrollView';

// ---------------------------------------------------------------------------
// ExampleApp — copy-paste template for a new mini-app.
//
// 1. Copy this whole folder:  miniapps/example  ->  miniapps/<your-id>
// 2. Rename ExampleApp -> <Your>App, update manifest.json (id, name, colors).
// 3. Register it: see README.md step 3 (apps.ts + MiniAppContent.tsx).
// 4. Publish to GitHub with miniapp.json at the repo root so the in-app
//    "Add" loader can install it from a URL (see README.md step 4).
// ---------------------------------------------------------------------------

type Props = {
  keyboardOffset: number;
};

const STORAGE_KEY = '@example-app/notes-v1';

export function ExampleApp({ keyboardOffset }: Props) {
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) setSavedNote(value);
    });
  }, []);

  const saveNote = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    void AsyncStorage.setItem(STORAGE_KEY, trimmed).then(() => {
      setSavedNote(trimmed);
      setNote('');
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardOffset}
      style={styles.fill}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        testID="example-app"
      >
        <Text style={styles.kicker}>TEMPLATE</Text>
        <Text style={styles.title}>Example mini-app</Text>
        <Text style={styles.body}>
          This is the smallest working mini-app. It stays mounted when you switch apps, scrolls
          with the shared ScrollView, and persists with its own AsyncStorage key.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>COUNTER STATE</Text>
          <Text style={styles.count} testID="example-count">
            {count}
          </Text>
          <View style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrement"
              onPress={() => setCount((c) => c - 1)}
              style={styles.button}
              testID="example-decrement"
            >
              <Text style={styles.buttonText}>−</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increment"
              onPress={() => setCount((c) => c + 1)}
              style={styles.button}
              testID="example-increment"
            >
              <Text style={styles.buttonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PERSISTED NOTE</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Type something, then save"
            placeholderTextColor="rgba(20,20,22,0.35)"
            style={styles.input}
            testID="example-input"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save note"
            onPress={saveNote}
            style={[styles.save, !note.trim() && styles.saveDisabled]}
            disabled={!note.trim()}
            testID="example-save"
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
          {savedNote ? <Text style={styles.saved}>Saved: {savedNote}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 24, paddingTop: 48, gap: 14 },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, color: 'rgba(20,20,22,0.45)' },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: '#141416' },
  body: { fontSize: 14, lineHeight: 20, color: 'rgba(20,20,22,0.7)' },
  card: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: '#F2F2F5',
    padding: 18,
    gap: 12,
  },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(20,20,22,0.45)' },
  count: { fontSize: 44, fontWeight: '800', color: '#141416', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#141416',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#141416',
  },
  save: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3D7BF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  saved: { fontSize: 13, color: 'rgba(20,20,22,0.6)' },
});
