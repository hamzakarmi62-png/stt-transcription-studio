import test from "node:test";
import assert from "node:assert/strict";
import { uploadFile } from "../src/api.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function verifiesChunkRecovery(missingPartsMessage) {
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = globalThis.localStorage;
  let chunkRequests = 0;
  let completeRequests = 0;

  globalThis.localStorage = { getItem: () => "test-token" };
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/upload/init")) {
      return json({ upload_id: "upload-123" });
    }
    if (String(url).endsWith("/upload/chunk")) {
      chunkRequests++;
      return json({ ok: true });
    }
    if (String(url).endsWith("/upload/complete")) {
      completeRequests++;
      if (chunkRequests === 3) {
        return json({ detail: missingPartsMessage }, 400);
      }
      return json({ id: "session-123" });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const size = 11 * 1024 * 1024;
  const file = {
    name: "large-video.mp4",
    size,
    type: "video/mp4",
    slice(start, end) {
      return new Blob([new Uint8Array(end - start)], { type: "video/mp4" });
    },
  };

  try {
    const session = await uploadFile(file, () => {});
    assert.equal(session.id, "session-123");
    assert.equal(chunkRequests, 6, "the three chunks should be sent again once");
    assert.equal(completeRequests, 2, "completion should be retried after re-upload");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalLocalStorage;
  }
}

test("recovers large uploads after English missing-parts error", async () => {
  await verifiesChunkRecovery("No parts were received; please try again.");
});

test("recovers large uploads after backend Arabic missing-parts error", async () => {
  await verifiesChunkRecovery("لم يتم استلام أي أجزاء، يرجى إعادة المحاولة");
});
