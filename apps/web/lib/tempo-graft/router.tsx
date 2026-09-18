"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  type ComponentProps,
  type ReactNode,
} from "react";

type LinkProps = {
  to?: string;
  href?: string;
  params?: Record<string, string>;
  search?: Record<string, string | undefined>;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof NextLink>, "href">;

function interpolate(path: string, params?: Record<string, string>) {
  let resolved = path;
  for (const [key, value] of Object.entries(params ?? {})) {
    resolved = resolved.replace(`$${key}`, encodeURIComponent(value));
  }
  return resolved;
}

export function Link({ to, href, params, search, children, className, ...rest }: LinkProps) {
  const path = interpolate(to ?? href ?? "/", params);
  const query = search
    ? Object.fromEntries(
        Object.entries(search).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : undefined;
  const qs =
    query && Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : "";
  return (
    <NextLink href={`${path}${qs}`} className={className} {...rest}>
      {children}
    </NextLink>
  );
}

export function Navigate({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}

type NavOpts = {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | undefined>;
};

function resolveTo(opts: string | NavOpts): string {
  if (typeof opts === "string") return opts;
  let path = opts.to;
  for (const [key, value] of Object.entries(opts.params ?? {})) {
    path = path.replace(`$${key}`, encodeURIComponent(value));
  }
  const search = opts.search
    ? Object.fromEntries(
        Object.entries(opts.search).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : undefined;
  const qs = search && Object.keys(search).length > 0
    ? `?${new URLSearchParams(search).toString()}`
    : "";
  return `${path}${qs}`;
}

export function useNavigate() {
  const router = useRouter();
  return (opts: string | NavOpts) => {
    router.push(resolveTo(opts));
  };
}

export function useRouterState<T>({
  select,
}: {
  select: (state: { location: { pathname: string } }) => T;
}): T {
  const pathname = usePathname() ?? "/";
  return select({ location: { pathname } });
}

export function createFileRoute(_path: string) {
  return (opts: { component: () => ReactNode }) => opts;
}

export function Outlet() {
  return null;
}
