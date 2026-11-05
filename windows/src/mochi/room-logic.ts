export type RoomLighting = "automatic" | "day" | "night";

export function roomLighting(value: unknown): RoomLighting {
  return value === "day" || value === "night" ? value : "automatic";
}

export function roomIsNight(value: unknown, hour: number): boolean {
  const lighting = roomLighting(value);
  return lighting === "night" || (lighting === "automatic" && (hour < 7 || hour >= 19));
}

export type RoomTheme = "sand" | "sage" | "rose" | "midnight";
export function roomTheme(value: unknown): RoomTheme {
  return value === "sage" || value === "rose" || value === "midnight" ? value : "sand";
}
