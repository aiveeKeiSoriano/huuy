import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { ReminderCard } from '../src/components/ReminderCard';
import { Text } from '../src/components/Text';
import { SettingsIcon, PlusIcon } from '../src/components/Icons';
import { loadRemindersAction } from '../src/actions/loadRemindersAction';
import { colors, spacing, radii } from '../src/theme';
import type { Reminder } from '../src/types/reminder';

export default function HomeScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRemindersAction().then(setReminders);
    }, []),
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/create?id=${id}`);
    },
    [router],
  );

  const handleDelete = useCallback(async (_id: string) => {
    // wired to deleteReminderAction in step 11
    const updated = await loadRemindersAction();
    setReminders(updated);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>huuy</Text>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SettingsIcon size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>wala langgg...</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create')}
        activeOpacity={0.8}
      >
        <PlusIcon size={28} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  appName: {
    color: colors.primary,
    fontSize: 32,
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: -100,
  },
  emptyText: {
    color: colors.highlight,
    fontSize: 18,
    opacity: 0.3,
  },
  list: {
    paddingBottom: 100,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    bottom: spacing.lg,
    elevation: 4,
    height: 64,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    width: 64,
  },
});
