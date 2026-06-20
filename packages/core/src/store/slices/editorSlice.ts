import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface EditorState {
  zoom: number
  activeSection: string
  mobileView: "editor" | "preview" | "ai"
  showAiPanel: boolean
}

const initialState: EditorState = {
  zoom: 100,
  activeSection: "",
  mobileView: "editor",
  showAiPanel: true,
}

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = state.activeSection === action.payload ? "" : action.payload
    },
    setMobileView: (state, action: PayloadAction<"editor" | "preview" | "ai">) => {
      state.mobileView = action.payload
    },
    setShowAiPanel: (state, action: PayloadAction<boolean>) => {
      state.showAiPanel = action.payload
    },
  },
})

export const { setZoom, setActiveSection, setMobileView, setShowAiPanel } = editorSlice.actions
export default editorSlice.reducer
