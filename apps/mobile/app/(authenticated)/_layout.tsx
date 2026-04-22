import { Redirect } from 'expo-router';

export default function AuthenticatedLayout() {
  return <Redirect href="/(tempo)/(tabs)/today" />;
}
