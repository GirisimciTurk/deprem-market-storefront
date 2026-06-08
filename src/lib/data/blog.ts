import fs from "fs"
import path from "path"
import { marked } from "marked"

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  image: string
  related_products: string[]
  contentHtml?: string
}

// Helper to parse YAML frontmatter and content body
function parseMarkdown(fileContent: string) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { data: {} as Record<string, any>, content: fileContent }
  }

  const yamlBlock = match[1]
  const contentBody = match[2]
  const data: Record<string, any> = {}

  yamlBlock.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":")
    if (separatorIndex > -1) {
      const key = line.slice(0, separatorIndex).trim()
      let value = line.slice(separatorIndex + 1).trim()

      // Handle simple string wrappers
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }

      // Handle JSON-like array for related products, e.g. ["t-shirt", "sweatshirt"]
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          data[key] = JSON.parse(value.replace(/'/g, '"'))
        } catch {
          // Fallback regex array parser if JSON.parse fails
          data[key] = value
            .slice(1, -1)
            .split(",")
            .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        }
      } else {
        data[key] = value
      }
    }
  })

  return { data, content: contentBody }
}

const getBlogDirectory = (countryCode: string) => {
  const locale = countryCode.toLowerCase() === "tr" ? "tr" : "en"
  // The content folder is in the root of the storefront workspace
  return path.join(process.cwd(), "content", "blog", locale)
}

export const listBlogPosts = async (countryCode: string): Promise<BlogPost[]> => {
  const dir = getBlogDirectory(countryCode)

  if (!fs.existsSync(dir)) {
    return []
  }

  const files = fs.readdirSync(dir)
  const posts: BlogPost[] = []

  for (const filename of files) {
    if (!filename.endsWith(".md")) continue

    const filePath = path.join(dir, filename)
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { data } = parseMarkdown(fileContent)
    const slug = filename.replace(/\.md$/, "")

    posts.push({
      slug,
      title: data.title || "Untitled",
      description: data.description || "",
      date: data.date || "",
      author: data.author || "",
      image: data.image || "",
      related_products: data.related_products || [],
    })
  }

  // Sort posts by date descending
  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

export const getBlogPost = async (
  slug: string,
  countryCode: string
): Promise<BlogPost | null> => {
  const dir = getBlogDirectory(countryCode)
  const filePath = path.join(dir, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = parseMarkdown(fileContent)
  const contentHtml = await marked.parse(content)

  return {
    slug,
    title: data.title || "Untitled",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "",
    image: data.image || "",
    related_products: data.related_products || [],
    contentHtml,
  }
}
