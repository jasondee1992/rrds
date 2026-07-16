import { Mail, Send } from "lucide-react";
import { PrimaryButton } from "../../components/public/PrimaryButton";
import { SectionTitle } from "../../components/public/SectionTitle";
import { contactDetails } from "../../data/publicData";

const fieldClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20";

export function ContactPage() {
  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="Use this frontend-only contact page layout for Phase 2. Replace placeholder company information when approved details are available."
            eyebrow="Contact Us"
            title="Get in Touch with RRDS"
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="rounded-lg bg-slate-950 p-6 text-white sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-500 text-slate-950">
                <Mail aria-hidden="true" className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Company Information</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Placeholder contact details for layout approval. Final phone, email, address,
                and business hours should be provided by RRDS before launch.
              </p>
              <ul className="mt-8 space-y-5">
                {contactDetails.map((detail) => (
                  <li className="flex gap-4" key={detail.label}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-300">
                      <detail.Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{detail.label}</span>
                      <span className="mt-1 block text-sm text-slate-300">{detail.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-950">Send a Message</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This form is visual only for Phase 2 and is not connected to a backend.
              </p>
              <form className="mt-8" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Full name
                    <input className={fieldClass} name="fullName" placeholder="Enter full name" type="text" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800">
                    Email
                    <input className={fieldClass} name="email" placeholder="Enter email address" type="email" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800">
                    Mobile number
                    <input className={fieldClass} name="mobileNumber" placeholder="Enter mobile number" type="tel" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800">
                    Subject
                    <input className={fieldClass} name="subject" placeholder="Enter subject" type="text" />
                  </label>
                  <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                    Message
                    <textarea
                      className={`${fieldClass} min-h-36 resize-y`}
                      name="message"
                      placeholder="Write your message"
                    />
                  </label>
                </div>
                <div className="mt-8 flex justify-end">
                  <PrimaryButton disabled className="gap-2 disabled:cursor-not-allowed disabled:bg-slate-400">
                    <Send aria-hidden="true" className="h-5 w-5" />
                    Send Message
                  </PrimaryButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
