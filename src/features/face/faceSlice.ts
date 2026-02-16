import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type FaceState = {
  images: string[];
  embedding: string | null;
  referenceEmbedding: number[] | null;
  isRegistered: boolean;
};

const initialState: FaceState = {
  images: [],
  embedding: null,
  referenceEmbedding: null,
  isRegistered: false,
};

const faceSlice = createSlice({
  name: 'face',
  initialState,
  reducers: {
    addFaceImage(state, action: PayloadAction<string>) {
      if (!Array.isArray(state.images)) {
        state.images = [];
      }

      if (state.images.length < 10) {
        state.images.push(action.payload);
      }
    },
    setReferenceEmbedding(state, action: PayloadAction<number[]>) {
      state.referenceEmbedding = action.payload;
    },

    setEmbedding(state, action: PayloadAction<string>) {
      state.embedding = action.payload;
    },

    setIsRegistered(state, action: PayloadAction<boolean>) {
      state.isRegistered = action.payload;
    },

    resetFace(state) {
      state.images = [];
      state.embedding = null;
      state.referenceEmbedding = null;
      state.isRegistered = false;
    },
  },
});

export const {
  addFaceImage,
  setEmbedding,
  resetFace,
  setReferenceEmbedding,
  setIsRegistered,
} = faceSlice.actions;
export default faceSlice.reducer;
