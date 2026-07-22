"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label, PlainInput, SelectInput, Textarea } from "@/components/ui/Field";

export function ContactSupportForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Your Name</Label>
          <PlainInput id="contact-name" required />
        </div>
        <div>
          <Label htmlFor="contact-email">Your Email</Label>
          <PlainInput id="contact-email" type="email" required />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-issue">Issue Type</Label>
        <SelectInput id="contact-issue" className="max-w-xs" defaultValue="General Inquiry">
          <option>General Inquiry</option>
          <option>Bug Report</option>
          <option>Feature Request</option>
          <option>Other</option>
        </SelectInput>
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" rows={4} required />
      </div>
      <Button type="submit">Submit</Button>
      {submitted && (
        <p className="text-sm text-brass-300">Thank you for reaching out — we&apos;ll get back to you soon.</p>
      )}
    </form>
  );
}
