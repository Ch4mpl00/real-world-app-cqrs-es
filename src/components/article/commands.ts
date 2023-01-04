import { IArticleRepository } from 'src/components/article/repository';
import * as ArticleDomain from 'src/components/article/domain';
import slugify from 'slugify';
import { Result } from '@badrap/result';
import { IArticleReadRepository } from 'src/components/article/readRepository';
import {
  ArticleError,
  createArticleNotFoundError,
  createNotAuthorizedToModifyArticleError
} from 'src/components/article/domain/errors';
import { ArticleAggregate } from 'src/components/article/domain';
import { AuthContext } from 'src/lib/common';

type ArticleDto = Omit<ArticleDomain.Article, 'slug'>

export const createCommandHandlers = (
  articleRepository: IArticleRepository,
  articleReadRepository: IArticleReadRepository
) => {
  const create = async (id: string, data: ArticleDto) => {
    const slug = `${slugify(data.title)}_${id}`;

    const result = ArticleDomain.create(
      id,
      { ...data, slug },
      { timestamp: new Date().getTime() }
    );

    if (result.isOk) await articleRepository.save(result.value);

    return result;
  };

  const update = async (id: string, data: ArticleDto, authContext: AuthContext): Promise<Result<ArticleAggregate, ArticleError>> => {
    const article = await articleRepository.get(id);
    if (!article) return Result.err(createArticleNotFoundError(id));
    if (article.state.authorId !== authContext.principalId) return Result.err(createNotAuthorizedToModifyArticleError());

    const slug = `${slugify(data.title || article.state.title)}_${id}`;
    const result = ArticleDomain.update(
      article,
      { ...data, slug },
      { timestamp: new Date().getTime() }
    );

    if (result.isOk) await articleRepository.save(result.value);

    return result;
  };

  const updateBySlug = async (slug: string, data: ArticleDto, authContext: AuthContext): Promise<Result<ArticleAggregate, ArticleError>> => {
    const article = await articleReadRepository.findBySlug(slug);
    if (!article) return Result.err(createArticleNotFoundError(slug));

    return update(article.id, data, authContext);
  };

  return {
    create,
    update,
    updateBySlug,
  };
};
