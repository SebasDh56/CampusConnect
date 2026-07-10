import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ kicker, title, description, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <p className="page-kicker">{kicker}</p>
        <h2 className="page-title">{title}</h2>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action ? <div className="page-actions">{action}</div> : null}
    </div>
  );
}
