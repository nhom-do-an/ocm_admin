import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'


const uiSlice = createSlice({
    name: 'ui',
    initialState: { theme: 'light' as 'light' | 'dark' },
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload
        }
    }
})


export const { setTheme } = uiSlice.actions


export const makeStore = () =>
    configureStore({
        reducer: { ui: uiSlice.reducer }
    })


export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']