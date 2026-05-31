import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, fonts } from '../theme';

const LETTERS = ['h', 'u', 'u', 'u', 'u', 'y', 'y', 'y'];
const DELAY_PER_LETTER = 200;  // 0.2s between each letter
const WAVE_DURATION = 1000;    // 2s total cycle

function WaveLetter({ char, delay }: { char: string; delay: number }) {
  const [translateY] = useState(() => new Animated.Value(0));

useEffect(() => {
  Animated.sequence([
    Animated.delay(delay),
    Animated.timing(translateY, {
      toValue: -20,
      duration: WAVE_DURATION / 2,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: WAVE_DURATION / 2,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }),
  ]).start();
}, [delay, translateY]);

  return (
    <Animated.Text style={[styles.letter, { transform: [{ translateY }] }]}>
      {char}
    </Animated.Text>
  );
}

export function Splash() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {LETTERS.map((char, i) => (
          <WaveLetter key={i} char={char} delay={i * DELAY_PER_LETTER} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  letter: {
    color: colors.primary,
    fontFamily: fonts.lilita,
    fontSize: 48,
  },
  row: {
    flexDirection: 'row',
  },
});
