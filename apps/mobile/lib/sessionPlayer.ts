export type SessionLogEntry = {
  routineId: string;
  completedAt: number;
};

type CompleteRoutineInput = {
  routineId: string;
  completedAt: number;
};

type SessionLogStorage = {
  read: () => readonly SessionLogEntry[];
  write: (entries: SessionLogEntry[]) => void;
};

type SessionLogStore = {
  completeRoutine: (input: CompleteRoutineInput) => SessionLogEntry[];
};

export function createSessionLogStore(storage: SessionLogStorage): SessionLogStore {
  return {
    completeRoutine(input: CompleteRoutineInput): SessionLogEntry[] {
      const entries = storage.read();
      const alreadyLogged = entries.some(
        (entry) =>
          entry.routineId === input.routineId && entry.completedAt === input.completedAt,
      );
      if (alreadyLogged) {
        return [...entries];
      }

      const nextEntries = [...entries, input];
      storage.write(nextEntries);
      return nextEntries;
    },
  };
}
