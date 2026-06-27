import React from "react"
import parse, { domToReact, Element } from "html-react-parser"

export function processHtmlBullets(
  html: string,
  itemId: string,
  allowedBulletIds?: string[]
) {
  if (!html) return null;

  let index = 0
  const options = {
    replace(node: any) {
      if (node instanceof Element && ["li", "p"].includes(node.name)) {
        const bulletId = `${itemId}-bullet-${index}`
        index++
        if (allowedBulletIds && !allowedBulletIds.includes(bulletId)) {
          return <></>
        }
        const props = { ...node.attribs, "data-bullet-id": bulletId }
        return React.createElement(
          node.name,
          props,
          domToReact(node.children as any, options)
        )
      }
    }
  }
  return parse(html, options)
}
