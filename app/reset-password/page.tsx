import ResetPasswordClient from "./ResetPasswordClient";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const raw = searchParams?.token;
  const token =
    Array.isArray(raw) ? (raw[0] as string | undefined) ?? null : (raw as string | undefined) ?? null;

  return <ResetPasswordClient token={token} />;
}
