import { NextResponse } from "next/server";

export async function GET() {
  // In the future, this can be moved to environment variables or a database.
  // For now, it is hardcoded to represent the latest version of the extension.
  const latestVersion = {
    version: "1.1",
    releaseNotes: "Added auto-fill functionality and improved Kanban sync.",
    updateUrl: "https://novacv-web.vercel.app/api/extension/download",
    forceUpdate: false,
  };

  return NextResponse.json(latestVersion);
}
