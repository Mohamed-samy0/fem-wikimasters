import { notFound, redirect } from "next/navigation";
import WikiEditor from "@/components/wiki-editor";
import { hexclaveServerApp } from "@/hexclave/server";
import { getArticleById } from "@/lib/data/articles";

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const _user = await hexclaveServerApp.getUser();
  // if (!user) {
  //   redirect("/handler/sign-in");
  // }

  // we'll uncomment this later when the articles have real IDs
  // if (user.id !== id) {
  //   stackServerApp.redirectToHome();
  // }

  // In a real app, you would fetch the article data here
  // For now, we'll just show some mock data if it's not "new"
  if (id === "new") {
    return <WikiEditor isEditing={true} articleId={id} />;
  }

  const article = await getArticleById(+id);
  if (!article) {
    notFound();
  }
  return (
    <WikiEditor
      initialTitle={article.title}
      initialContent={article.content}
      isEditing={true}
      articleId={id}
    />
  );
}
