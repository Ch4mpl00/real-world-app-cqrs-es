import { ArticleDomainEvent } from 'src/components/article/domain/events';

export type Tag = string

export type Article = Readonly<{
    slug: string
    title: string
    description: string
    body: string
    tagList: Tag[]
    authorId: string
}>

export type ArticleAggregate = Readonly<{
    id: string
    version: number
    type: 'article'
    state: Article,
    newEvents: ArticleDomainEvent[]
}>
