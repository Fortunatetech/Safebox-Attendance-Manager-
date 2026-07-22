import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-md border border-graphite-600 bg-graphite-900/70 px-3.5 py-2.5 text-[15px] text-ink-100 placeholder:text-ink-600 transition-colors focus:border-brass-400 focus:outline-none disabled:opacity-50";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-ink-400"
    >
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} font-mono tracking-wide ${props.className ?? ""}`} />;
}

export function PlainInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${fieldBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%238B98A3%22><path d=%22M5.5 7.5l4.5 5 4.5-5%22 stroke=%22%238B98A3%22 stroke-width=%221.4%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${props.className ?? ""}`}
    >
      {props.children}
    </select>
  );
}
