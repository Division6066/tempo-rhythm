import { ModuleScreen, moduleByKey } from "@/components/ModuleShell";

export default function HomeRoute() {
  return <ModuleScreen module={moduleByKey.home} />;
}
