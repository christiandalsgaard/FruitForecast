/**
 * Recipe suggestion utility using the Spoonacular API.
 *
 * Fetches recipes that use the currently in-season produce as ingredients.
 * Requires a SPOONACULAR_KEY in config/api.js (free tier: 150 req/day).
 * When no key is present, returns an empty array gracefully.
 *
 * Results are cached for 6 hours to stay within rate limits.
 */

import { getCached, TTL } from "./cache";
import { SPOONACULAR_KEY, hasKey } from "../config/api";

const BASE_URL = "https://api.spoonacular.com/recipes";

/**
 * Find recipes that use the given produce items as ingredients.
 *
 * @param {string[]} ingredients — list of produce names (e.g. ["strawberries", "blueberries"])
 * @param {number} count — max number of recipes to return
 * @returns {Array<{ id, title, image, usedIngredients, missedIngredients }>}
 */
export async function findRecipes(ingredients, count = 4) {
  // No API key → return empty without hitting the network
  if (!hasKey(SPOONACULAR_KEY) || ingredients.length === 0) {
    return [];
  }

  // Sort ingredients for cache key stability so ["apple","pear"]
  // and ["pear","apple"] hit the same cache entry.
  const sorted = [...ingredients].sort().join(",");
  const cacheKey = `recipes:${sorted}:${count}`;

  return getCached(
    cacheKey,
    async () => {
      const url =
        `${BASE_URL}/findByIngredients` +
        `?ingredients=${encodeURIComponent(sorted)}` +
        `&number=${count}` +
        `&ranking=2` +          // Maximize used ingredients
        `&ignorePantry=true` +  // Don't count salt, oil, etc.
        `&apiKey=${SPOONACULAR_KEY}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Spoonacular ${response.status}`);

      const data = await response.json();
      return data.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        // Which of our in-season ingredients this recipe uses
        usedIngredients: recipe.usedIngredients?.map((i) => i.name) || [],
        // What else you'd need to buy
        missedIngredients: recipe.missedIngredients?.map((i) => i.name) || [],
        // Direct link to the recipe on Spoonacular
        sourceUrl: `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, "-").toLowerCase()}-${recipe.id}`,
      }));
    },
    TTL.RECIPES,
  );
}
