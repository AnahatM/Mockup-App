import { ADVANCED_ARTICLES } from './advanced'
import { GETTING_STARTED_ARTICLES } from './gettingStarted'
import { MOCKUPS_ARTICLES } from './mockups'
import { OUTPUT_ARTICLES } from './output'
import { STUDIO_ARTICLES } from './studio'
import type { DocArticle } from '../types'

/**
 * The manual, in reading order.
 *
 * Article bodies live in `.md` files and are imported raw, so they are edited as
 * markdown rather than as escaped strings — and so these stay readable tables of
 * contents rather than thousands of lines of prose.
 */
export const DOC_ARTICLES: readonly DocArticle[] = [
  ...GETTING_STARTED_ARTICLES,
  ...MOCKUPS_ARTICLES,
  ...STUDIO_ARTICLES,
  ...OUTPUT_ARTICLES,
  ...ADVANCED_ARTICLES,
]
