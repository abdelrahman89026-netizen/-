const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

const PROJECT_ID = "demo-no-project";
const DATABASE_ID = "ai-studio-android-ai-beb5b6cb-1d17-4fef-89f5-6bdb90cac5f7";

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8085,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

test("unauthenticated user cannot read journeys", async () => {
  const unauthedDb = testEnv.unauthenticatedContext().firestore({ databaseId: DATABASE_ID });
  const journeyRef = unauthedDb.doc("users/user1/journeys/journey1");
  await assertFails(journeyRef.get());
});

test("authenticated owner can read and write own journey", async () => {
  const authedDb = testEnv.authenticatedContext("user1").firestore({ databaseId: DATABASE_ID });
  const journeyRef = authedDb.doc("users/user1/journeys/journey1");
  await assertSucceeds(
    journeyRef.set({
      id: "journey1",
      userId: "user1",
      title: "تجديد بطاقة الرقم القومي",
      status: "IN_PROGRESS",
      progress: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );
  await assertSucceeds(journeyRef.get());
});

test("user cannot read another user's journey", async () => {
  const user1Db = testEnv.authenticatedContext("user1").firestore({ databaseId: DATABASE_ID });
  await user1Db.doc("users/user1/journeys/journey1").set({
    id: "journey1",
    userId: "user1",
    title: "رحلة خاصة",
    status: "IN_PROGRESS",
    progress: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user2Db = testEnv.authenticatedContext("user2").firestore({ databaseId: DATABASE_ID });
  await assertFails(user2Db.doc("users/user1/journeys/journey1").get());
});
