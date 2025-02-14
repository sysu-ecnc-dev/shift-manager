import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    title?: string;
    options?: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }
}
