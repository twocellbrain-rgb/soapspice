# Publishing SoapSpice articles and recipes

SoapSpice is built as a static site for Hostinger. To publish an article, add it to `src/data/published-soapmaking-posts.ts`, rebuild the site, and redeploy. There is no public-site upload form or online draft editor.

## Add a post

Add an object to `publishedSoapmakingPosts` with:

- `slug`: lowercase words separated by hyphens; this becomes `/recipes/<slug>/`.
- `title`, `kind` (`article` or `recipe`), `excerpt`, `publishedAt` (`YYYY-MM-DD`), and `body`. Write a clear, unique excerpt of about 130–155 characters.
- `seoTitle` and `seoDescription`: optional page-specific search metadata. Keep titles concise and descriptions between 130 and 160 characters.
- `body`: an array of sections with a heading and paragraphs; sections can also have `bullets` or numbered `steps`.
- `recipeDetails`: optional yield, oil weight, superfat, cure time, formula table, notes, and validation caveat for recipes.
- `ingredients` and `equipment`: arrays of `id`, reader-facing `name`, and a specific `searchTerm` for the Amazon search link; `note` is optional.
- `citations`: optional source links. For external material, write an original short SoapSpice summary and link to the publisher; do not copy full article text or photos without permission.

## Add an image

Upload an original or licensed image to `public/images/`. Add its site path, descriptive alt text, and the image's actual pixel width and height to the post's `image` object. An optional caption is displayed below the image and used to explain illustrative or AI-generated artwork.

The page builds the ingredient and equipment affiliate links below the full article and includes the site's Amazon disclosure. Links are search suggestions, not verified products or live prices. The build generates each post as a crawlable page and adds it to the sitemap. Review the search terms and article safety details before publishing.
