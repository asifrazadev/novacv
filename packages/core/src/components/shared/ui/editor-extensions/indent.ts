import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem'],
      indentLevels: [0, 24, 48, 72, 96, 120, 144, 168, 192],
      defaultIndentLevel: 0,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: this.options.defaultIndentLevel,
            parseHTML: element => {
              const paddingLeft = element.style.paddingLeft || ''
              const parsed = parseInt(paddingLeft, 10)
              if (Number.isNaN(parsed)) {
                return this.options.defaultIndentLevel
              }
              return parsed
            },
            renderHTML: attributes => {
              if (attributes.indent === this.options.defaultIndentLevel) {
                return {}
              }
              return {
                style: `padding-left: ${attributes.indent}px`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0
            const nextLevelIndex = this.options.indentLevels.findIndex((level: number) => level > currentIndent)
            const newIndent = nextLevelIndex !== -1 ? this.options.indentLevels[nextLevelIndex] : this.options.indentLevels[this.options.indentLevels.length - 1]
            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: newIndent,
              })
            }
          }
        })
        return true
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0
            const nextLevelIndex = this.options.indentLevels.slice().reverse().findIndex((level: number) => level < currentIndent)
            const newIndent = nextLevelIndex !== -1 ? this.options.indentLevels.slice().reverse()[nextLevelIndex] : 0
            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: newIndent,
              })
            }
          }
        })
        return true
      },
    }
  },
})
