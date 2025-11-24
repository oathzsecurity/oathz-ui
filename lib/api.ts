export async function fetchAPI(path: string) {
  const base = "https://api.oathzsecurity.com";
  const url = `${base}${path}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  return res.json();
}
