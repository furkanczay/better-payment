import { Info, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "success" | "tip";

const styles: Record<CalloutType, { icon: React.ElementType; cls: string }> = {
  info: {
    icon: Info,
    cls: "bg-blue-500/8 border-blue-500/20 text-blue-700 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    cls: "bg-yellow-500/8 border-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  },
  success: {
    icon: CheckCircle,
    cls: "bg-green-500/8 border-green-500/20 text-green-700 dark:text-green-400",
  },
  tip: {
    icon: Lightbulb,
    cls: "bg-primary/8 border-primary/20 text-primary",
  },
};

export default function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: React.ReactNode;
}) {
  const { icon: Icon, cls } = styles[type];

  return (
    <div className={cn("flex gap-3 rounded-lg border px-4 py-3.5 my-4 text-sm leading-relaxed", cls)}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}
