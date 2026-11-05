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

export const ROOM_STYLES = ["cozy", "gamer", "minimalist", "mediterranean"] as const;
export type RoomStyle = typeof ROOM_STYLES[number];
export function roomStyle(value: unknown): RoomStyle {
  return value === "gamer" || value === "minimalist" || value === "mediterranean" ? value : "cozy";
}
export type RoomActivity = "desk" | "rest" | "plant";
export function roomActivity(value: unknown): RoomActivity {
  return value === "rest" || value === "plant" ? value : "desk";
}
