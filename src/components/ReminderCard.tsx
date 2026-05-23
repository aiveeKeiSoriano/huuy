import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing, radii, borderWidth } from '../theme';
import type { Reminder } from '../types/reminder';

import { ExclamationIcon, TrashIcon } from './Icons';
import { Text } from './Text';

type Props = {
  reminder: Reminder;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

export function ReminderCard({ reminder, onDelete, onEdit }: Props) {
  const { t } = useTranslation();

  const timeStr = new Date(reminder.triggerTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const isToday = new Date(reminder.triggerTime).toDateString() === new Date().toDateString();
  const formattedTime = isToday ? `${t('today')}, ${timeStr}` : `${t('tomorrow')}, ${timeStr}`;

  return (
    <TouchableOpacity
      style={[styles.card, reminder.missedAlarm && styles.cardMissed]}
      onPress={() => onEdit(reminder.id)}
      activeOpacity={0.8}
    >
      <Text style={styles.label}>{t('cardLabel')}</Text>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <View style={styles.textBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, reminder.missedAlarm && styles.titleMissed]}>{reminder.title}</Text>
              {reminder.missedAlarm && (
                <ExclamationIcon size={24} color={colors.primary} />
              )}
            </View>
            <Text style={styles.time}>{formattedTime}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(reminder.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <TrashIcon size={22} color={colors.highlight} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tertiary,
    borderColor: colors.secondary,
    borderRadius: radii.md,
    borderWidth: borderWidth.thin,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  label: {
    color: colors.highlight,
    fontSize: 12,
    opacity: 0.4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  titleBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  textBlock: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    color: colors.highlight,
    flexShrink: 1,
    fontSize: 20,
  },
  titleMissed: {
      textDecorationLine: 'line-through',
      opacity: 0.5,
  },
  cardMissed: {
    borderColor: colors.primary,
  },
  time: {
    color: colors.highlight,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.6,
  },
});
