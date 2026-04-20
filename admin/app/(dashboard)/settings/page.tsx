import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input type={type} defaultValue={defaultValue} />
    </label>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Configuration"
        title="Settings"
        description="Manage store identity, operator details, and support contact information."
        action={
          <Button variant="outline" type="button">
            Review changes
          </Button>
        }
      />

      <Notice
        tone="info"
        message="These settings are presentation placeholders and do not yet write back to persistent store configuration."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Admin profile"
          kicker="Identity"
          bodyClassName="space-y-5"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            Keep operator details current so order escalations and audit history stay clear.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" defaultValue="Admin User" />
            <Field
              label="Email"
              type="email"
              defaultValue="admin@kittikbeauty.com"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Store settings"
          kicker="Storefront"
          bodyClassName="space-y-5"
        >
          <p className="text-sm leading-6 text-muted-foreground">
            These values shape the store contact layer used by support, packaging, and operations notices.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Store name" defaultValue="Kittik Beauty" />
            <Field
              label="Support email"
              type="email"
              defaultValue="support@kittikbeauty.com"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
