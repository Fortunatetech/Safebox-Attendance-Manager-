"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, PlainInput, SelectInput } from "@/components/ui/Field";
import { FilterChip } from "@/components/admin/FilterChip";

const NOTIFICATION_EVENTS = ["Late Arrival", "Early Leave", "Absenteeism", "Daily Summary"];
const ROLES = ["Super Admin", "HR", "Team Lead", "Employee"] as const;
const PERMISSIONS: Record<(typeof ROLES)[number], string[]> = {
  "Super Admin": ["Full Access"],
  HR: ["Manage Employees", "View Reports"],
  "Team Lead": ["View Reports", "Approve Leave"],
  Employee: ["View Own Attendance"],
};

export function SettingsForm() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [events, setEvents] = useState<string[]>(["Late Arrival", "Early Leave"]);
  const [role, setRole] = useState<(typeof ROLES)[number]>("Super Admin");
  const [saved, setSaved] = useState(false);

  const toggleEvent = (event: string) => {
    setEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]));
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-100">Notification Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm text-ink-300">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-graphite-600 bg-graphite-900 accent-brass-500"
            />
            Enable email notifications
          </label>
          {emailNotifications && (
            <PlainInput placeholder="admin@safebox.co" defaultValue="admin@safebox.co" className="max-w-sm" />
          )}

          <label className="flex items-center gap-3 text-sm text-ink-300">
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-graphite-600 bg-graphite-900 accent-brass-500"
            />
            Enable SMS notifications
          </label>
          {smsNotifications && <PlainInput placeholder="+234 800 000 0000" className="max-w-sm" />}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-ink-400">
            Notify me for
          </p>
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_EVENTS.map((event) => (
              <FilterChip key={event} active={events.includes(event)} onClick={() => toggleEvent(event)}>
                {event}
              </FilterChip>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-100">Working Hours</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="start-time">Start time</Label>
            <PlainInput id="start-time" type="time" defaultValue="09:00" />
          </div>
          <div>
            <Label htmlFor="end-time">End time</Label>
            <PlainInput id="end-time" type="time" defaultValue="17:00" />
          </div>
          <div>
            <Label htmlFor="break-start">Break start</Label>
            <PlainInput id="break-start" type="time" defaultValue="12:00" />
          </div>
          <div>
            <Label htmlFor="break-end">Break end</Label>
            <PlainInput id="break-end" type="time" defaultValue="12:40" />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-100">Permissions</h2>
        <Label htmlFor="role-select">Role</Label>
        <SelectInput
          id="role-select"
          className="max-w-xs"
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </SelectInput>
        <p className="mt-3 text-sm text-ink-400">
          Permissions for <span className="text-ink-100">{role}</span>: {PERMISSIONS[role].join(", ")}
        </p>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          }}
        >
          Save Settings
        </Button>
        {saved && <span className="text-sm text-brass-300">Settings updated successfully.</span>}
      </div>
    </div>
  );
}
