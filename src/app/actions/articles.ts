"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import db from "@/db";
import { authorizeUserToEditArticle } from "@/db/authZ";
import { articles } from "@/db/schema";
import { ensureUserExists } from "@/db/sync-user";
import { hexclaveServerApp } from "@/hexclave/server";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }
  await ensureUserExists(user);

  console.log("✨ createArticle called:", data);
  const response = await db
    .insert(articles)
    .values({
      title: data.title,
      content: data.content,
      slug: `${Date.now()}`,
      published: true,
      authorId: user.id,
      imageUrl: data.imageUrl ?? undefined,
    })
    .returning({ id: articles.id });

  const articleId = response[0]?.id;
  fetch("http://127.0.0.1:7370/ingest/4a5087fe-d0ec-4a60-bf59-db9c2440ff33", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c5525c" },
    body: JSON.stringify({
      sessionId: "c5525c",
      runId: "pre-fix",
      hypothesisId: "C",
      location: "articles.ts:createArticle:exit",
      message: "createArticle insert result",
      data: { articleId: articleId ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return { success: true, message: "Article create logged", id: articleId };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }
  console.log("📝 updateArticle called:", { id, ...data });
  await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl ?? undefined,
    })
    .where(eq(articles.id, +id));
  return { success: true, message: `Article ${id} update logged (stub)` };
}

export async function deleteArticle(id: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("❌ Unauthorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("❌ Forbidden");
  }

  console.log("🗑️ deleteArticle called:", id);
  await db.delete(articles).where(eq(articles.id, +id));
  return { success: true, message: `Article ${id} delete logged (stub)` };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}
