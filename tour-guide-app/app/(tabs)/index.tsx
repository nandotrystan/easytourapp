// app/(tabs)/index.tsx (dentro da pasta tabs)
import { View, Text } from 'react-native';

export default function TabHome() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home das Tabs - Conteúdo principal do app</Text>
    </View>
  );
}