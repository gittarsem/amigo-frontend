import { randomUUID } from "node:crypto";
import { getAuth } from "@clerk/express";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  CreateClanBody,
  CreateClanResponse,
  CreateConnectionBody,
  CreateConnectionResponse,
  CreatePlanBody,
  CreatePlanResponse,
  GetBuddiesResponse,
  GetClanParams,
  GetClanResponse,
  GetConversationParams,
  GetConversationResponse,
  GetEventParams,
  GetEventResponse,
  GetHomeFeedResponse,
  GetPersonParams,
  GetPersonResponse,
  GetProfileResponse,
  GetSettingsResponse,
  JoinClanParams,
  JoinClanResponse,
  JoinPlanParams,
  JoinPlanResponse,
  ListClansQueryParams,
  ListClansResponse,
  ListConversationsResponse,
  ListEventsQueryParams,
  ListEventsResponse,
  ListNotificationsResponse,
  ListPeopleQueryParams,
  ListPeopleResponse,
  ListPlansResponse,
  SaveOnboardingResponse,
  SaveOnboardingBody,
  SearchAmigoQueryParams,
  SearchAmigoResponse,
  SendMessageBody,
  SendMessageResponse,
  UpdateNotificationBody,
  UpdateNotificationParams,
  UpdateNotificationResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
} from "@workspace/api-zod";
import {
  demoClans,
  demoConversations,
  demoEvents,
  demoMessages,
  demoNotifications,
  demoPeople,
  demoPlans,
  demoProfile,
  demoSettings,
} from "../lib/amigo-demo-data";
import {
  getAllRecords,
  getRecord,
  getRecords,
  saveRecord,
  type AmigoData,
} from "../lib/amigo-store";

const router: IRouter = Router();

function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function requireUserId(req: Request, res: Response): string | null {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to continue." });
    return null;
  }
  return userId;
}

function matchesQuery(values: string[], query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return (
    !normalizedQuery ||
    values.some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
  );
}

function findPerson(personId: string) {
  return demoPeople.find((person) => person.id === personId);
}

async function allClans() {
  const [created, memberships] = await Promise.all([
    getAllRecords<AmigoData>("clan"),
    getAllRecords<{ clanId: string }>("clan-membership"),
  ]);
  const joinedCount = new Map<string, number>();
  for (const membership of memberships) {
    joinedCount.set(
      membership.clanId,
      (joinedCount.get(membership.clanId) ?? 0) + 1,
    );
  }
  return [
    ...demoClans,
    ...created.map((item) => CreateClanResponse.parse(item)),
  ].map((clan) => ({
    ...clan,
    membersCount: clan.membersCount + (joinedCount.get(clan.id) ?? 0),
  }));
}

async function allPlans() {
  const [created, participants] = await Promise.all([
    getAllRecords<AmigoData>("plan"),
    getAllRecords<{ planId: string }>("plan-participation"),
  ]);
  const joinedCount = new Map<string, number>();
  for (const participation of participants) {
    joinedCount.set(
      participation.planId,
      (joinedCount.get(participation.planId) ?? 0) + 1,
    );
  }
  return [
    ...demoPlans,
    ...created.map((item) => CreatePlanResponse.parse(item)),
  ].map((plan) => ({
    ...plan,
    peopleCount: plan.peopleCount + (joinedCount.get(plan.id) ?? 0),
  }));
}

router.get("/home-feed", (_req, res): void => {
  res.json(
    GetHomeFeedResponse.parse({
      featuredEvent: demoEvents[0],
      events: demoEvents.slice(1),
      people: demoPeople,
      clans: demoClans.slice(0, 3),
    }),
  );
});

router.get("/events", (req, res): void => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q = "", category = "", time = "" } = parsed.data;
  let events = demoEvents.filter((event) =>
    matchesQuery([event.title, event.category, event.location], q),
  );
  if (category && category.toLowerCase() !== "all") {
    events = events.filter(
      (event) => event.category.toLowerCase() === category.toLowerCase(),
    );
  }
  if (time.toLowerCase() === "tonight") {
    const today = new Date().toISOString().slice(0, 10);
    events = events.filter((event) => event.startsAt.slice(0, 10) === today);
  } else if (
    time.toLowerCase() === "this weekend" ||
    time.toLowerCase() === "weekend"
  ) {
    events = events.filter((event) => event.id !== "indie-night");
  }

  res.json(ListEventsResponse.parse(events));
});

router.get("/events/:eventId", (req, res): void => {
  const params = GetEventParams.safeParse({ eventId: getParam(req, "eventId") });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const event = demoEvents.find((item) => item.id === params.data.eventId);
  if (!event) {
    res.status(404).json({ error: "Event not found." });
    return;
  }
  res.json(
    GetEventResponse.parse({
      event,
      interestedPeople: demoPeople.slice(0, 2),
    }),
  );
});

router.get("/people", (req, res): void => {
  const parsed = ListPeopleQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const people = demoPeople.filter((person) =>
    matchesQuery(
      [person.name, person.location, person.bio, ...person.interests],
      parsed.data.q ?? "",
    ),
  );
  res.json(ListPeopleResponse.parse(people));
});

router.get("/people/:personId", (req, res): void => {
  const params = GetPersonParams.safeParse({
    personId: getParam(req, "personId"),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const person = findPerson(params.data.personId);
  if (!person) {
    res.status(404).json({ error: "Person not found." });
    return;
  }
  res.json(
    GetPersonResponse.parse({
      person,
      sharedInterests: person.interests.slice(0, 2),
      sharedEvent: "YJHD Fan Screening",
      upcomingPlans: demoPlans.slice(0, 1),
      clans: demoClans.slice(0, 2),
    }),
  );
});

router.get("/buddies", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  const requested = userId
    ? await getRecords<{ personId: string; status: string }>(
        "connection",
        userId,
      )
    : [];
  const connectedIds = new Set(
    requested.filter((item) => item.status === "connected").map((item) => item.personId),
  );
  const connections = userId
    ? demoPeople.filter((person) => connectedIds.has(person.id))
    : demoPeople.slice(0, 1);
  res.json(
    GetBuddiesResponse.parse({
      connections,
      requests: demoPeople.slice(3, 4),
      suggestions: demoPeople.filter(
        (person) => !connectedIds.has(person.id) && person.id !== "sana",
      ),
      upcomingPlans: demoPlans.slice(0, 1),
    }),
  );
});

router.post("/connections", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = CreateConnectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = `connection:${userId}:${parsed.data.personId}`;
  const connection = {
    id,
    personId: parsed.data.personId,
    status: "requested",
  };
  await saveRecord(id, "connection", userId, {
    ...connection,
    message: parsed.data.message,
    eventId: parsed.data.eventId ?? null,
  });
  res.status(201).json(CreateConnectionResponse.parse(connection));
});

router.get("/clans", async (req, res): Promise<void> => {
  const parsed = ListClansQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getAuth(req).userId;
  const clans = await allClans();
  const memberships = userId
    ? await getRecords<{ clanId: string }>("clan-membership", userId)
    : [];
  const joinedIds = new Set(memberships.map((item) => item.clanId));
  const filtered = clans
    .filter((clan) =>
      matchesQuery(
        [clan.name, clan.category, clan.description],
        parsed.data.q ?? "",
      ),
    )
    .filter(
      (clan) =>
        !parsed.data.category ||
        parsed.data.category.toLowerCase() === "all" ||
        clan.category.toLowerCase() === parsed.data.category.toLowerCase(),
    )
    .map((clan) => ({
      ...clan,
      isJoined: clan.isJoined || joinedIds.has(clan.id),
    }));
  res.json(ListClansResponse.parse(filtered));
});

router.post("/clans", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = CreateClanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const clan = {
    id: `clan-${randomUUID()}`,
    ...parsed.data,
    membersCount: 1,
    isJoined: true,
  };
  await Promise.all([
    saveRecord(clan.id, "clan", userId, {
      ...clan,
      membersCount: 0,
      isJoined: false,
    }),
    saveRecord(`clan-membership:${userId}:${clan.id}`, "clan-membership", userId, {
      clanId: clan.id,
    }),
  ]);
  res.status(201).json(CreateClanResponse.parse(clan));
});

router.get("/clans/:clanId", async (req, res): Promise<void> => {
  const params = GetClanParams.safeParse({ clanId: getParam(req, "clanId") });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const clans = await allClans();
  const clan = clans.find((item) => item.id === params.data.clanId);
  if (!clan) {
    res.status(404).json({ error: "Community not found." });
    return;
  }
  const userId = getAuth(req).userId;
  const membership = userId
    ? await getRecord<{ clanId: string }>(
        `clan-membership:${userId}:${clan.id}`,
        userId,
      )
    : undefined;
  res.json(
    GetClanResponse.parse({
      clan: { ...clan, isJoined: clan.isJoined || !!membership },
      events: demoEvents.filter((event) =>
        event.category.toLowerCase().includes(clan.category.toLowerCase()),
      ),
      members: demoPeople,
    }),
  );
});

router.post("/clans/:clanId/join", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const params = JoinClanParams.safeParse({ clanId: getParam(req, "clanId") });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const clans = await allClans();
  const clan = clans.find((item) => item.id === params.data.clanId);
  if (!clan) {
    res.status(404).json({ error: "Community not found." });
    return;
  }
  const id = `clan-membership:${userId}:${clan.id}`;
  const existing = await getRecord<{ clanId: string }>(id, userId);
  if (!existing) {
    await saveRecord(id, "clan-membership", userId, { clanId: clan.id });
  }
  res.json(
    JoinClanResponse.parse({
      clanId: clan.id,
      joined: true,
      membersCount: clan.membersCount + (existing ? 0 : 1),
    }),
  );
});

router.get("/plans", async (_req, res): Promise<void> => {
  const plans = await allPlans();
  res.json(ListPlansResponse.parse(plans));
});

router.post("/plans", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = CreatePlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const plan = {
    id: `plan-${randomUUID()}`,
    ...parsed.data,
    peopleCount: 1,
  };
  await saveRecord(plan.id, "plan", userId, plan);
  res.status(201).json(CreatePlanResponse.parse(plan));
});

router.post("/plans/:planId/join", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const params = JoinPlanParams.safeParse({ planId: getParam(req, "planId") });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const plans = await allPlans();
  const plan = plans.find((item) => item.id === params.data.planId);
  if (!plan) {
    res.status(404).json({ error: "Plan not found." });
    return;
  }
  const id = `plan-participation:${userId}:${plan.id}`;
  const existing = await getRecord<{ planId: string }>(id, userId);
  if (!existing) {
    await saveRecord(id, "plan-participation", userId, { planId: plan.id });
  }
  res.json(
    JoinPlanResponse.parse({
      planId: plan.id,
      status: "going",
      peopleCount: plan.peopleCount + (existing ? 0 : 1),
    }),
  );
});

router.get("/messages", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  const savedMessages = userId
    ? await getRecords<{
        id: string;
        personId: string;
        body: string;
        sentAt: string;
        isMine: boolean;
      }>("message", userId)
    : [];
  const summaries = demoConversations.map((conversation) => {
    const newest = savedMessages
      .filter((message) => message.personId === conversation.person.id)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
    return newest
      ? {
          ...conversation,
          lastMessage: newest.body,
          updatedAt: newest.sentAt,
        }
      : conversation;
  });
  res.json(ListConversationsResponse.parse(summaries));
});

router.get("/messages/:personId", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse({
    personId: getParam(req, "personId"),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const person = findPerson(params.data.personId);
  if (!person) {
    res.status(404).json({ error: "Conversation not found." });
    return;
  }
  const userId = getAuth(req).userId;
  const savedMessages = userId
    ? await getRecords<{
        id: string;
        personId: string;
        body: string;
        sentAt: string;
        isMine: boolean;
      }>("message", userId)
    : [];
  const messages = [
    ...demoMessages.filter((message) => message.personId === person.id),
    ...savedMessages.filter((message) => message.personId === person.id),
  ].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  res.json(GetConversationResponse.parse({ person, messages }));
});

router.post("/messages", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!findPerson(parsed.data.personId)) {
    res.status(404).json({ error: "Person not found." });
    return;
  }
  const message = {
    id: `message-${randomUUID()}`,
    personId: parsed.data.personId,
    body: parsed.data.body,
    sentAt: new Date().toISOString(),
    isMine: true,
  };
  await saveRecord(message.id, "message", userId, message);
  res.status(201).json(SendMessageResponse.parse(message));
});

router.get("/notifications", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  const updates = userId
    ? await getRecords<AmigoData>("notification", userId)
    : [];
  const byId = new Map(
    updates.map((notification) => [
      String(notification.id),
      notification,
    ]),
  );
  const notifications = demoNotifications.map((notification) => ({
    ...notification,
    ...(byId.get(notification.id) ?? {}),
  }));
  res.json(ListNotificationsResponse.parse(notifications));
});

router.patch("/notifications/:notificationId", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const params = UpdateNotificationParams.safeParse({
    notificationId: getParam(req, "notificationId"),
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current = demoNotifications.find(
    (notification) => notification.id === params.data.notificationId,
  );
  if (!current) {
    res.status(404).json({ error: "Notification not found." });
    return;
  }
  const notification = { ...current, ...parsed.data };
  await saveRecord(
    `notification:${userId}:${notification.id}`,
    "notification",
    userId,
    notification,
  );
  res.json(UpdateNotificationResponse.parse(notification));
});

router.get("/profile", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  const saved = userId
    ? await getRecord<AmigoData>(`profile:${userId}`, userId)
    : undefined;
  const profile = saved
    ? { ...demoProfile, ...saved }
    : userId
      ? { ...demoProfile, id: userId }
      : demoProfile;
  res.json(GetProfileResponse.parse(profile));
});

router.patch("/profile", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current =
    (await getRecord<AmigoData>(`profile:${userId}`, userId)) ??
    { ...demoProfile, id: userId };
  const profile = { ...current, ...parsed.data, id: userId };
  await saveRecord(`profile:${userId}`, "profile", userId, profile);
  res.json(UpdateProfileResponse.parse(profile));
});

router.get("/settings", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  const saved = userId
    ? await getRecord<AmigoData>(`settings:${userId}`, userId)
    : undefined;
  res.json(GetSettingsResponse.parse({ ...demoSettings, ...saved }));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current =
    (await getRecord<AmigoData>(`settings:${userId}`, userId)) ?? demoSettings;
  const settings = { ...current, ...parsed.data };
  await saveRecord(`settings:${userId}`, "settings", userId, settings);
  res.json(UpdateSettingsResponse.parse(settings));
});

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchAmigoQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const q = parsed.data.q;
  const clans = await allClans();
  const events = demoEvents.filter((event) =>
    matchesQuery([event.title, event.category, event.location], q),
  );
  const people = demoPeople.filter((person) =>
    matchesQuery([person.name, person.bio, ...person.interests], q),
  );
  const matchedClans = clans.filter((clan) =>
    matchesQuery([clan.name, clan.category, clan.description], q),
  );
  res.json(
    SearchAmigoResponse.parse({
      events,
      people,
      clans: matchedClans,
    }),
  );
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const parsed = SaveOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await saveRecord(
    `onboarding:${userId}`,
    "onboarding",
    userId,
    parsed.data,
  );
  res.json(SaveOnboardingResponse.parse({ saved: true }));
});

export default router;
