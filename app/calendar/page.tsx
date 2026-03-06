import CalendarClient from "@/components/CalendarClient";

export default function page() {
  return (
    <main className="wrapper">
      <section
        className={`inner min-h-[calc(100dvh-10.75rem)] text-3xl !mx-auto !w-full h-full !p-2 flex flex-col items-center justify-start`}
      >
        <CalendarClient />
      </section>
    </main>
  );
}
