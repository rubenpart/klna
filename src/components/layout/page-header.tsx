import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function PageFilters({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {children}
    </div>
  );
}

export function TableScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}

export function MobileCardList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 lg:hidden">{children}</div>;
}

export function DesktopTable({ children }: { children: React.ReactNode }) {
  return <div className="hidden lg:block">{children}</div>;
}
