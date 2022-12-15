import { IArticleRepository } from 'src/components/article/repository';
import * as ArticleDomain from 'src/components/article/domain';
import slugify from 'slugify';

type ArticleDto = Omit<ArticleDomain.Article, 'slug'>

export const createCommandHandlers = (
  articleRepository: IArticleRepository
) => ({
  create: async (id: string, data: ArticleDto) => {
    const slug = slugify(data.title);
    const result = ArticleDomain.create(
      id,
      { ...data, slug },
      { timestamp: new Date().getTime() }
    );

    if (result.isOk) await articleRepository.save(result.value);

    return result;
  }
});
