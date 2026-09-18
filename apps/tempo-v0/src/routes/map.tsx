import { createFileRoute } from "@tanstack/react-router";
import { MapView } from "@/components/tempo/map-view";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  return <MapView />;
}
