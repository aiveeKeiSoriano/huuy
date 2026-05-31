import { Text as RNText, TextProps, StyleSheet } from 'react-native';

import { fonts, colors } from '../theme';

export function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.base, style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.tertiary,
    fontFamily: fonts.lilita,
  },
});
