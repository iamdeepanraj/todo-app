import db from "@/db";
import { todosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>().basePath('/api');

app.use(
	"/api/auth/*", // or replace with "*" to enable cors for all routes
	cors({
		origin: "http://localhost:3000", // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
  	if (!session) {
    	c.set("user", null);
    	c.set("session", null);
    	await next();
        return;
  	}
  	c.set("user", session.user);
  	c.set("session", session.session);
  	await next();
});


app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.post("/todos", async (c) => {
  const user = c.get("user")

  if (!user) return c.json({ message: "Unauthorized" }, 401)
  const { title } = await c.req.json();
  const todo = await db
    .insert(todosTable)
    .values({ title, completed: false, userId: user.id })
    .returning();
  return c.json(todo[0], 201);
});

app.get("/todos/:userId", async (c) => {
  const user = c.get("user")
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const {userId} = c.req.param()

  if (user.id !== userId) return c.json({ message: "Unauthorized" }, 401)

  const todos = await db.select().from(todosTable).where(eq(todosTable.userId, userId));
  return c.json(todos, 200);
});

app.put("/todos/:id", async (c) => {
  const user = c.get("user")
  if (!user) return c.json({ message: "Unauthorized" }, 401)
  const { id } = c.req.param();
  const { title, completed } = await c.req.json();
  const todo = await db
    .update(todosTable)
    .set({ title, completed })
    .where(eq(todosTable.id, Number(id)))
    .returning();
  return c.json(todo[0], 200);
});

app.delete("/todos/:id", async (c) => {
  const user = c.get("user")
  if (!user) return c.json({ message: "Unauthorized" }, 401)
  const { id } = c.req.param();
  await db.delete(todosTable).where(eq(todosTable.id, Number(id)));
  return c.json({ message: "Todo deleted" }, 200);
});


export { app };
