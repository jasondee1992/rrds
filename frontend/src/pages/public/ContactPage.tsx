import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrimaryButton } from "../../components/public/PrimaryButton";
import { SecondaryButton } from "../../components/public/SecondaryButton";
import { SectionTitle } from "../../components/public/SectionTitle";
import { contactDetails } from "../../data/publicData";
import { getSafeApiErrorMessage } from "../../services/apiError";
import { submitPublicContact } from "../../services/publicContactService";

const fieldClass =
  "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20";

const contactFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(120, "Full name is too long."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160, "Email is too long."),
  mobileNumber: z.string().trim().min(1, "Mobile number is required.").max(40, "Mobile number is too long."),
  subject: z.string().trim().min(1, "Subject is required.").max(160, "Subject is too long."),
  message: z.string().trim().min(1, "Message is required.").max(4000, "Message is too long."),
  website: z.string().trim().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const defaultValues: ContactFormValues = {
  fullName: "",
  email: "",
  mobileNumber: "",
  subject: "",
  message: "",
  website: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-red-700">{message}</p>;
}

export function ContactPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  const isSubmitted = referenceNumber.length > 0;

  async function onSubmit(values: ContactFormValues) {
    setSubmitError("");

    try {
      const result = await submitPublicContact(values);
      setReferenceNumber(result.referenceNumber);
      reset(defaultValues);
    } catch (error) {
      setSubmitError(
        getSafeApiErrorMessage(
          error,
          "Unable to submit your inquiry right now. Please try again later.",
        ),
      );
    }
  }

  function handleSubmitAnother() {
    setReferenceNumber("");
    setSubmitError("");
    reset(defaultValues);
  }

  return (
    <main>
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            description="Reach RRDS for air-conditioning service inquiries, estimate follow-ups, and site inspection coordination."
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
                Contact RRDS Airconditioning Services directly or send a message using the form.
              </p>
              <ul className="mt-8 space-y-5">
                {contactDetails.map((detail) => (
                  <li className="flex gap-4" key={detail.label}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-300">
                      <detail.Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{detail.label}</span>
                      {detail.href ? (
                        <a
                          className="mt-1 block break-words text-sm text-slate-300 hover:text-white"
                          href={detail.href}
                          rel="noreferrer"
                          target={detail.href.startsWith("http") ? "_blank" : undefined}
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <span className="mt-1 block text-sm text-slate-300">{detail.value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-950">Send a Message</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Send your question or service request and RRDS will review your inquiry.
              </p>

              {isSubmitted ? (
                <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-base font-bold text-emerald-950">
                    Thank you for contacting RRDS Airconditioning Services.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-emerald-900">
                    Your inquiry reference number is{" "}
                    <span className="font-bold">{referenceNumber}</span>. Please keep this
                    number for future reference.
                  </p>
                  <SecondaryButton className="mt-5" onClick={handleSubmitAnother}>
                    Submit another inquiry
                  </SecondaryButton>
                </div>
              ) : (
                <form className="mt-8" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
                  <input
                    {...register("website")}
                    aria-hidden="true"
                    autoComplete="off"
                    className="hidden"
                    tabIndex={-1}
                    type="text"
                  />
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-800">
                      Full name
                      <input
                        {...register("fullName")}
                        aria-invalid={Boolean(errors.fullName)}
                        className={fieldClass}
                        disabled={isSubmitting}
                        placeholder="Enter full name"
                        type="text"
                      />
                      <FieldError message={errors.fullName?.message} />
                    </label>
                    <label className="text-sm font-semibold text-slate-800">
                      Email
                      <input
                        {...register("email")}
                        aria-invalid={Boolean(errors.email)}
                        className={fieldClass}
                        disabled={isSubmitting}
                        placeholder="Enter email address"
                        type="email"
                      />
                      <FieldError message={errors.email?.message} />
                    </label>
                    <label className="text-sm font-semibold text-slate-800">
                      Mobile number
                      <input
                        {...register("mobileNumber")}
                        aria-invalid={Boolean(errors.mobileNumber)}
                        className={fieldClass}
                        disabled={isSubmitting}
                        placeholder="Enter mobile number"
                        type="tel"
                      />
                      <FieldError message={errors.mobileNumber?.message} />
                    </label>
                    <label className="text-sm font-semibold text-slate-800">
                      Subject
                      <input
                        {...register("subject")}
                        aria-invalid={Boolean(errors.subject)}
                        className={fieldClass}
                        disabled={isSubmitting}
                        placeholder="Enter subject"
                        type="text"
                      />
                      <FieldError message={errors.subject?.message} />
                    </label>
                    <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                      Message
                      <textarea
                        {...register("message")}
                        aria-invalid={Boolean(errors.message)}
                        className={`${fieldClass} min-h-36 resize-y`}
                        disabled={isSubmitting}
                        placeholder="Write your message"
                      />
                      <FieldError message={errors.message?.message} />
                    </label>
                  </div>
                  {submitError ? (
                    <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                      {submitError}
                    </div>
                  ) : null}
                  <div className="mt-8 flex justify-end">
                    <PrimaryButton
                      className="gap-2 disabled:cursor-not-allowed disabled:bg-slate-400"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      <Send aria-hidden="true" className="h-5 w-5" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </PrimaryButton>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
