import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './features/theme/themeSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
        theme: themeReducer,
    }
  })
}