import { eq } from "drizzle-orm";
import db from "@/db/index";
import { articles, usersSync } from "@/db/schema";

export async function getArticles() {
  const res = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  return res;
}

export async function getArticleById(id: number) {
  const res = await db
    .select({
      title: articles.title,
      id: articles.id,
      createdAt: articles.createdAt,
      content: articles.content,
      author: usersSync.name,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(eq(articles.id, id))
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id));

  return res[0] ? res[0] : null;
}
