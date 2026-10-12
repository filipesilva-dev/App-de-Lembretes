import React, { useEffect } from "react";
import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import HomeScreen from "./src/screens/HomeScreen";
import CreateReminderScreen from "./src/screens/CreateReminderScreen";
import type { RootStackParamList } from "./src/navigation/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  useEffect(() => {
    const pedirPermissao = async (): Promise<void> => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Você precisa permitir notificações para usar este app!");
      }
    };

    const configurarCategorias = async (): Promise<void> => {
      await Notifications.setNotificationCategoryAsync("lembrete", [
        { identifier: "concluir", buttonTitle: "Concluir" },
        { identifier: "adiar", buttonTitle: "Adiar 10 min" },
      ]);
    };

    pedirPermissao();
    configurarCategorias();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Meus Lembretes" }}
        />
        <Stack.Screen
          name="CreateReminder"
          component={CreateReminderScreen}
          options={{ title: "Novo Lembrete" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
