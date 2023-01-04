export type ArticleNotFound = Readonly<{
    name: 'ArticleNotFound',
    message: string,
}>

export type ArticleAuthorCannotBeChanged = Readonly<{
    name: 'ArticleAuthorCannotBeChanged',
    message: string,
}>

export type NotAuthorizedToModifyArticle = Readonly<{
    name: 'NotAuthorizedToModifyArticle',
    message: string,
}>

export type ArticleError =
    | ArticleAuthorCannotBeChanged
    | NotAuthorizedToModifyArticle
    | ArticleNotFound

export const createArticleAuthorCannotBeChangedError = (): ArticleAuthorCannotBeChanged => ({
  name: 'ArticleAuthorCannotBeChanged',
  message: 'Author of article cannot be changed',
});

export const createArticleNotFoundError = (id: string): ArticleNotFound => ({
  name: 'ArticleNotFound',
  message: `Article "${id}" not found`,
});

export const createNotAuthorizedToModifyArticleError = (): NotAuthorizedToModifyArticle => ({
  name: 'NotAuthorizedToModifyArticle',
  message: 'Article can be updated only by it\'s author',
});
