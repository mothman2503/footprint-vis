// context/CategoryFilterContext.jsx
import { createContext, useContext, useReducer } from "react";

const CategoryFilterContext = createContext();

const initialState = {
  excludedCategoryIds: [], // holds the IDs of excluded categories as strings
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_CATEGORY": {
      const id = action.payload;
      const isExcluded = state.excludedCategoryIds.includes(id);
      return {
        ...state,
        excludedCategoryIds: isExcluded
          ? state.excludedCategoryIds.filter((catId) => catId !== id)
          : [...state.excludedCategoryIds, id],
      };
    }
    case "SET_EXCLUDED":
      return {
        ...state,
        excludedCategoryIds: action.payload,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function CategoryFilterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CategoryFilterContext.Provider value={{ state, dispatch }}>
      {children}
    </CategoryFilterContext.Provider>
  );
}

export function useCategoryFilter() {
  return useContext(CategoryFilterContext);
}
