import { eq } from "drizzle-orm";
import db from "@/db/index";
import { articles } from "./schema";

export const authorizeUserToEditArticle =
  async function authorizeUserToEditArticle(
    loggedInUserId: string,
    articleId: number,
  ) {
    const res = await db
      .select({
        authorId: articles.authorId,
      })
      .from(articles)
      .where(eq(articles.id, articleId));

    if (!res.length) return false;

    return res[0].authorId === loggedInUserId;
  };
