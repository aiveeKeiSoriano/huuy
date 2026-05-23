import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { useAlert } from '../src/components/Alert';
import { Loading } from '../src/components/Loading';
import { ReminderCard } from '../src/components/ReminderCard';
import { Text } from '../src/components/Text';
import { SettingsIcon, PlusIcon } from '../src/components/Icons';
import { loadRemindersAction } from '../src/actions/loadRemindersAction';
import { deleteReminderAction } from '../src/actions/deleteReminderAction';
import { colors, spacing, radii } from '../src/theme';
import type { Reminder } from '../src/types/reminder';

export default function HomeScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { alert, showAlert } = useAlert();

  const fetchReminders = useCallback(async () => {
    const result = await loadRemindersAction();
    if (result.success) setReminders(result.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReminders().finally(() => setLoading(false));
    }, [fetchReminders]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  }, [fetchReminders]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/create?id=${id}`);
    },
    [router],
  );

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteReminderAction(id);
    if (!result.success) return;
    const updated = await loadRemindersAction();
    if (updated.success) setReminders(updated.data);
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

      {loading || refreshing ? (
        <Loading />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, reminders.length === 0 && styles.listEmpty]}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onDelete={(id) => showAlert('delete this reminder?', () => handleDelete(id))}
              onEdit={handleEdit}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>wala langgg...</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              progressBackgroundColor={colors.tertiary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create')}
        activeOpacity={0.8}
      >
        <PlusIcon size={28} color={colors.background} />
      </TouchableOpacity>


      {alert}
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
  listEmpty: {
    flex: 1,
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
