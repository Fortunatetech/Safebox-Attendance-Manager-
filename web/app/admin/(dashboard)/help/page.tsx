import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { ContactSupportForm } from "@/components/admin/ContactSupportForm";

const FAQS = [
  {
    q: "How do I add a new employee?",
    a: "Go to Employee Management, fill in the details in the Add Employee dialog, and click Add Employee.",
  },
  {
    q: "How can I view detailed attendance reports?",
    a: "Open Detailed Reports, apply the date, department, or status filters, and export to CSV or PDF if needed.",
  },
  {
    q: "What should I do if an employee's data is incorrect?",
    a: "In Employee Management, click Edit on that employee's row, correct the fields, and save.",
  },
];

export default function HelpPage() {
  return (
    <div>
      <PageHeader title="Help & Support" description="FAQs, a quick guide, and how to reach us." />
      <div className="space-y-6 px-6 py-6 sm:px-10">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-ink-100">
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-graphite-700">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-3 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none text-sm font-medium text-ink-200 marker:content-none">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-brass-400 transition-transform group-open:rotate-90">›</span>
                    {item.q}
                  </span>
                </summary>
                <p className="mt-2 pl-5 text-sm text-ink-400">{item.a}</p>
              </details>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-ink-100">User Guide</h2>
          <div className="space-y-2 text-sm text-ink-400">
            <p><span className="text-ink-200">Overview</span> — quick summary of attendance metrics and trends.</p>
            <p><span className="text-ink-200">Detailed Reports</span> — in-depth attendance data with filters and export.</p>
            <p><span className="text-ink-200">Employee Management</span> — add, edit, and remove employee records.</p>
            <p><span className="text-ink-200">Settings</span> — notifications, working hours, and role permissions.</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-ink-100">Contact Support</h2>
          <ContactSupportForm />
        </Card>
      </div>
    </div>
  );
}
