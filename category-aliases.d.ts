export const FOOD_WINE_NAME: "Food & Wine";
export const FOOD_WINE_SLUG: "food-and-wine";
export function isRetiredTopic(value: unknown): boolean;
export function normalizeTopic<T>(value: T): T | "Food & Wine";
export function normalizeTopicSlug<T>(value: T): T | "food-and-wine";
export function normalizeTopicList(values: string[]): string[];
export function normalizeTopicFields<T>(value: T, context?: string): T;
