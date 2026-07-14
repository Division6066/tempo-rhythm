import TicketsIndex from "./index";

type PageProps = {
  searchParams?: Promise<{
    fixture?: string | string[];
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  return <TicketsIndex searchParams={await searchParams} />;
}
