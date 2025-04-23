// /lib/chatMemory.ts
export const chatMemory = new Map<string, {
    lastDoctor?: { id: string, firstName: string, lastName: string },
    lastSlots?: { id: string, startTime: string, endTime: string }[]
  }>()
  