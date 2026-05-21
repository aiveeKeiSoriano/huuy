import { StyleSheet, View } from 'react-native';

import { Text } from '../src/components/Text';
import { colors } from '../src/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>huuy</Text>
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
  text: {
    color: colors.primary,
    fontSize: 32,
  },
});
