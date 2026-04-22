import { Redirect } from 'expo-router';

export default function AuthenticatedHomePage() {
  return <Redirect href="/(tempo)/(tabs)/today" />;
}
