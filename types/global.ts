export type FeedLog = {
  date: string;
  slot: "morning" | "afternoon" | "evening" | "night" | "special";
  done_at: string;
};

export type CompletedMap = Partial<Record<FeedLog["slot"], string>>;
