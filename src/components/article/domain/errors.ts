export type ArticleNotFound = Readonly<{
    name: 'ArticleNotFound',
    message: string,
}>

export type ArticleAuthorCannotBeChanged = Readonly<{
    name: 'ArticleAuthorCannotBeChanged',
    message: string,
}>

export type OnlyAuthorCanUpdateArticle = Readonly<{
    name: 'OnlyAuthorCanUpdateArticle',
    message: string,
}>

export type ArticleError =
    | ArticleAuthorCannotBeChanged
    | OnlyAuthorCanUpdateArticle
    | ArticleNotFound

export const createArticleAuthorCannotBeChangedError = (): ArticleAuthorCannotBeChanged => ({
  name: 'ArticleAuthorCannotBeChanged',
  message: 'Author of article cannot be changed',
});

export const createArticleNotFoundError = (id: string): ArticleNotFound => ({
  name: 'ArticleNotFound',
  message: `Article "${id}" not found`,
});

export const createOnlyAuthorCanUpdateArticleError = (): OnlyAuthorCanUpdateArticle => ({
  name: 'OnlyAuthorCanUpdateArticle',
  message: 'Article can be updated only by it\'s author',
});
