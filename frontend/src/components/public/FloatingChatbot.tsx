import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const chatOptions = [
  "I need a quotation",
  "I have a question",
  "Schedule a service",
  "Talk to a representative",
];

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <section
          aria-label="Chatbot placeholder"
          className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm rounded-lg border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">RRDS Chat</h2>
              <p className="text-xs text-slate-600">Frontend placeholder only</p>
            </div>
            <button
              aria-label="Close chat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-700"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4 p-5">
            <p className="rounded-lg bg-blue-50 p-4 text-sm font-medium leading-6 text-slate-800">
              Hello! How can we help you today?
            </p>
            <div className="grid gap-2">
              {chatOptions.map((option) => (
                <button
                  className="rounded-md border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-700 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
                  key={option}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <button
        aria-label={isOpen ? "Chat is open" : "Open chat"}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <MessageCircle aria-hidden="true" className="h-7 w-7" />
      </button>
    </div>
  );
}
