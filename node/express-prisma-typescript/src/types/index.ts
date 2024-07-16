export type ClassType<T> = new (...args: any[]) => T

export interface CursorPagination {
  limit?: number
  before?: string
  after?: string
}

/**
 * @typedef OffsetPagination
 *
 * @description Offset-Limit Pagination
 *
 * Read more about Offset-Limit Pagination https://www.prisma.io/docs/concepts/components/prisma-client/pagination#offset-pagination
 *
 * @property {number} limit - The amount of records to return
 * @property {number} skip - The amount of records to skip
 */
export interface OffsetPagination {
  limit?: number
  skip?: number
}
