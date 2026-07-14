import { TicketBoard } from "@/components/tickets/TicketBoard";
import { aw34FixtureData, emptyTicketBoardData } from "@/components/tickets/fixture-data";
import type { TicketBoardData } from "@/components/tickets/types";

type TicketsSearchParams = {
  fixture?: string | string[];
};

type TicketsIndexProps = {
  searchParams?: TicketsSearchParams;
};

function getFixtureName(searchParams: TicketsSearchParams | undefined) {
  const fixture = searchParams?.fixture;
  return Array.isArray(fixture) ? fixture[0] : fixture;
}

function getTicketBoardData(searchParams: TicketsSearchParams | undefined): TicketBoardData {
  const fixture = getFixtureName(searchParams);

  if (fixture === "empty") {
    return emptyTicketBoardData;
  }

  // AW-03/AW-32 live Convex `tickets.*` and `ticketEvents` APIs are not present in
  // this checkout, so the board uses the AW-34 fixture contract for browser tests.
  return aw34FixtureData;
}

export default function TicketsIndex({ searchParams }: TicketsIndexProps) {
  const data = getTicketBoardData(searchParams);
  return <TicketBoard data={data} />;
}
