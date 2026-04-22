export type GreetingWindow = "morning" | "afternoon" | "evening";

export type GreetingData = {
  window: GreetingWindow;
  greeting: string;
  displayName?: string;
};

function getGreetingWindow(date: Date): GreetingWindow {
  const hour = date.getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

function getGreetingLabel(window: GreetingWindow): string {
  switch (window) {
    case "morning":
      return "Morning.";
    case "afternoon":
      return "Afternoon.";
    case "evening":
      return "Evening.";
  }
}

export function greetingFor(date: Date, displayName?: string): GreetingData {
  const window = getGreetingWindow(date);

  return {
    window,
    greeting: getGreetingLabel(window),
    displayName,
  };
}
