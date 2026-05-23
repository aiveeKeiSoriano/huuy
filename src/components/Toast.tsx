import { useRef, useState, useCallback } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

import { colors, spacing, radii } from '../theme';

import { Text } from './Text';

export function useToast() {
  const [message, setMessage] = useState('');
  const [persistent, setPersistent] = useState(false);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const showToast = useCallback(
    (msg: string, options?: { persistent?: boolean }) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      setPersistent(options?.persistent ?? false);
      opacity.setValue(1);
      if (!options?.persistent) {
        timer.current = setTimeout(() => dismiss(), 2500);
      }
    },
    [opacity, dismiss],
  );

  const toast = (
    <Animated.View style={[styles.container, persistent && styles.containerRow, { opacity }]} pointerEvents={persistent ? 'auto' : 'none'}>
      <Text style={styles.text}>{message}</Text>
      {persistent && (
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return { toast, showToast };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    alignSelf: 'center',
    bottom: 30,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: colors.highlight,
    fontSize: 14,
    textAlign: 'center',
  },
  close: {
    color: colors.highlight,
    fontSize: 16,
    marginLeft: spacing.sm,
    opacity: 0.8,
  },
});
