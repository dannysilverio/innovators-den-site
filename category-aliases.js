export const FOOD_WINE_NAME = "Food & Wine";
export const FOOD_WINE_SLUG = "food-and-wine";
export function isRetiredTopic(value) {
  return typeof value === "string" && value.trim().toLowerCase() === "dining";
}
export function normalizeTopic(value) {
  return isRetiredTopic(value) || value === FOOD_WINE_SLUG ? FOOD_WINE_NAME : value;
}
export function normalizeTopicSlug(value) {
  return isRetiredTopic(value) || value === FOOD_WINE_NAME ? FOOD_WINE_SLUG : value;
}
export function normalizeTopicList(values) {
  const mapped = values.map(normalizeTopic);
  return mapped.filter((value, index) => value !== FOOD_WINE_NAME || mapped.indexOf(value) === index);
}
/** Only category-bearing fields change. Article wording and unrelated values do not. */
export function normalizeTopicFields(value, context = "") {
  if (Array.isArray(value)) {
    if (["topics", "topicPreferences", "followedTopics", "categories", "topicTargeting", "topic_targeting", "targeting"].includes(context))
      return normalizeTopicList(value);
    if (context === "tags") return [...new Set(value.map(normalizeTopicSlug))];
    return value.map(item => normalizeTopicFields(item, context));
  }
  if (!value || typeof value !== "object") {
    return ["topic", "category", "articleTopic"].includes(context) ? normalizeTopic(value) : value;
  }
  // Preserve raw webhook bytes and other non-JSON objects.
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return value;
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const mapContext = ["verticalScores", "tagScores", "vertical_scores", "tag_scores", "targeting", "topicTargeting"].includes(context);
    const mappedKey = mapContext && isRetiredTopic(key)
      ? (["tagScores", "tag_scores"].includes(context) ? FOOD_WINE_SLUG : FOOD_WINE_NAME) : key;
    const mapped = key === "targetId" && value.targetType === "topic"
      ? normalizeTopicSlug(item) : normalizeTopicFields(item, key);
    if (mappedKey in result && typeof result[mappedKey] === "number" && typeof mapped === "number")
      result[mappedKey] += mapped;
    else Object.defineProperty(result, mappedKey, { value: mapped, enumerable: true, writable: true, configurable: true });
  }
  return result;
}
