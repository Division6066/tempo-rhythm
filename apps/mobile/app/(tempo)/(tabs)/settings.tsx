import { ModuleScreen, moduleByKey } from "@/components/ModuleShell";

export default function SettingsRoute() {
  return <ModuleScreen module={moduleByKey.settings} />;
}
