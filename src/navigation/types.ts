import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  CreateReminder: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type CreateReminderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateReminder'
>;
