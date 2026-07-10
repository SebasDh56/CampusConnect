import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
