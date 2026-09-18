import { createFileRoute } from "@/lib/tempo-graft/router";
import { MapView } from "@tempo-v0/components/tempo/map-view";

export const Route = createFileRoute("/map")({ component: MapPage });

function MapPage() {
  return <MapView />;
}
