import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your admin profile and basic store settings."
      />

      <div className="grid gap-6">
        <SectionCard title="Admin Profile">
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                defaultValue="admin@kittikbeauty.com"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Store Settings">
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                defaultValue="Kittik Beauty"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@kittikbeauty.com"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
