import assert from "node:assert/strict";
import test from "node:test";
import { validateDenOriginalText } from "./den-editorial";

for (const field of ["title", "subtitle", "summary", "content", "videoCaption"]) {
  test(`Den original rejects an em dash in ${field}`, () => {
    assert.throws(
      () => validateDenOriginalText("The Innovators Den", { [field]: "Before\u2014after" }),
      new RegExp(`cannot contain em dashes.*${field}`),
    );
  });
}

test("guard does not rewrite clean editorial text or affect external RSS", () => {
  const text = { title: "A title: A subtitle", summary: "An aside (with context).", content: "A list, and a sentence.\n\nA second paragraph." };
  const before = structuredClone(text);
  validateDenOriginalText("The Innovators Den", text);
  assert.deepEqual(text, before);
  assert.doesNotThrow(() => validateDenOriginalText("External RSS", { content: "Source text\u2014unchanged." }));
  assert.doesNotThrow(() => validateDenOriginalText("The Innovators Den", { content: "9:16 video, 10–12 and well-written." }));
  assert.throws(() => validateDenOriginalText(" the innovators den ", { content: "Before\u2014after" }), /cannot contain em dashes/);
});
