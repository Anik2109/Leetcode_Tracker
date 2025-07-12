import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authslice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
    }
})