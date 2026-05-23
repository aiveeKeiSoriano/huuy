import { useCallback, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, radii } from "../theme";

import { Text } from "./Text";

type AlertConfig = { message: string; onConfirm: () => void };

export function useAlert() {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((message: string, onConfirm: () => void) => {
    setConfig({ message, onConfirm });
  }, []);

  const dismiss = useCallback(() => setConfig(null), []);

  const alert = (
    <Modal
      visible={!!config}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      navigationBarTranslucent
      statusBarTranslucent
    >
      <SafeAreaProvider>
          <SafeAreaView style={styles.backdrop}>
            <View style={styles.dialog}>
              <Text style={styles.message}>{config?.message}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={dismiss} style={styles.button}>
                  <Text style={styles.cancelText}>cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    config?.onConfirm();
                    dismiss();
                  }}
                  style={styles.button}
                >
                  <Text style={styles.confirmText}>delete</Text>
                </TouchableOpacity>
              </View>
            </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );

  return { alert, showAlert };
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.lg,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  dialog: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.md,
    padding: spacing.md,
    width: "100%",
  },
  message: {
    color: colors.highlight,
    fontSize: 16,
    marginVertical: spacing.sm,
    marginStart: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.highlight,
    fontSize: 16,
    opacity: 0.5,
  },
  confirmText: {
    color: colors.primary,
    fontSize: 16,
  },
});
