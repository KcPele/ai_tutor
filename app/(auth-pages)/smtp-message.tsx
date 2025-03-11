import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="bg-muted/30 px-4 py-3 border border-border/50 rounded-md flex gap-3 text-xs">
      <InfoIcon size={14} className="mt-0.5 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="text-secondary-foreground">
          <span className="font-medium">Note:</span> Emails are rate limited.
          Enable Custom SMTP to increase the rate limit.
        </p>
        <Link
          href="https://supabase.com/docs/guides/auth/auth-smtp"
          target="_blank"
          className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Learn more <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}
