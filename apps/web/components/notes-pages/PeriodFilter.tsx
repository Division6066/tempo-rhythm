"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PeriodFilterValue } from "./filterNotes";

export function PeriodFilter({ value }: { value: PeriodFilterValue }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <fieldset aria-label="Page type" className="flex flex-wrap gap-2">
      {(["all", "daily", "weekly", "monthly"] as const).map((type) => (
        <Button
          key={type}
          type="button"
          variant={value === type ? "default" : "outline"}
          aria-pressed={value === type}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("type", type);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }}
        >
          {type[0].toUpperCase() + type.slice(1)}
        </Button>
      ))}
    </fieldset>
  );
}
