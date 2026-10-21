import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeTopic, normalizeTopicSlug, normalizeTopicList, normalizeTopicFields } from "./category-aliases.js";
import { domainRedirect } from "./site-domain.js";

test("legacy topic labels and values resolve to the existing category only", () => {
  for (const value of ["Dining", "dining", " DINING "]) {
    assert.equal(normalizeTopic(value), "Food & Wine");
    assert.equal(normalizeTopicSlug(value), "food-and-wine");
  }
  for (const value of ["Culture", "Food", "Business", "Sports"])
    assert.equal(normalizeTopic(value), value);
  assert.deepEqual(normalizeTopicList(["Music", "Dining", "Food & Wine", "Travel"]), ["Music", "Food & Wine", "Travel"]);
});
test("category fields normalize without changing writing or unrelated values", () => {
  assert.deepEqual(normalizeTopicFields({
    topic: "Dining", title: "Dining", content: "Dining", topicPreferences: ["Dining", "Sports"],
    targetType: "topic", targetId: "Dining", verticalScores: { Dining: 3, "Food & Wine": 2, Music: 7 },
  }), {
    topic: "Food & Wine", title: "Dining", content: "Dining", topicPreferences: ["Food & Wine", "Sports"],
    targetType: "topic", targetId: "food-and-wine", verticalScores: { "Food & Wine": 5, Music: 7 },
  });
});
test("old category links preserve the query and other categories do not redirect", () => {
  assert.equal(domainRedirect("localhost", "/web/topics/Dining?keep=yes"), "/web/topics/food-and-wine?keep=yes");
  assert.equal(domainRedirect("theinnovatorsden.xyz", "/topics/dining?keep=yes"), "https://theinnovatorsden.net/web/topics/food-and-wine?keep=yes");
  assert.equal(domainRedirect("localhost", "/web/topics/Culture"), null);
});
test("raw webhook bodies and prototypes remain intact", () => {
  const raw = Buffer.from('{"topic":"Dining"}');
  assert.equal(normalizeTopicFields(raw), raw);
  const normalized = normalizeTopicFields(JSON.parse('{"__proto__":{"polluted":true},"topic":"Dining"}'));
  assert.equal(Object.getPrototypeOf(normalized), Object.prototype);
  assert.equal(normalized.polluted, undefined);
  assert.equal(normalized.topic, "Food & Wine");
  assert.deepEqual(normalizeTopicFields({ topicTargeting: ["Dining", "Food & Wine", "Sports"] }),
    { topicTargeting: ["Food & Wine", "Sports"] });
});
