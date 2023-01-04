import { ArticleProjection } from 'src/components/article/readRepository';

export const createArticleApiView = (article: ArticleProjection) => {
  return {
    ...article,
    createdAt: new Date(article.createdAt).toISOString(),
    updatedAt: new Date(article.updatedAt).toISOString(),
    favorited: false
  };
};
