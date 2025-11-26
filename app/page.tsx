import HomeClient from "./HomeClient";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function HomePage({ searchParams }: PageProps) {
  const raw = searchParams?.redirect;
  const redirect =
    Array.isArray(raw) ? (raw[0] as string | undefined) ?? null : raw ?? null;

  return <HomeClient redirect={redirect} />;
}