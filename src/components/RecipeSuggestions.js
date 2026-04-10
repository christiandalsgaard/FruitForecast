/**
 * RecipeSuggestions — collapsible section showing recipes that use
 * currently peak-season produce. Only renders if SPOONACULAR_KEY is
 * configured in config/api.js. Lazy-loads recipes on expand.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "../utils/theme";
import { findRecipes } from "../utils/recipes";
import { SPOONACULAR_KEY, hasKey } from "../config/api";

export default function RecipeSuggestions({ peakProduceNames }) {
  const [expanded, setExpanded] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [loading, setLoading] = useState(false);

  // Don't render anything if no API key is configured
  if (!hasKey(SPOONACULAR_KEY)) return null;

  // Fetch recipes when expanded — lazy loading to conserve API quota
  useEffect(() => {
    if (!expanded || recipes !== null || peakProduceNames.length === 0) return;

    setLoading(true);
    findRecipes(peakProduceNames, 4)
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(() => {
        setRecipes([]);
        setLoading(false);
      });
  }, [expanded, peakProduceNames, recipes]);

  return (
    <View style={styles.container}>
      {/* Toggle header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerIcon}>🍳</Text>
        <Text style={styles.headerText}>Recipes with Peak Produce</Text>
        <Text style={styles.chevron}>{expanded ? "▴" : "▾"}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.loadingText}>Finding recipes…</Text>
            </View>
          )}

          {recipes && recipes.length === 0 && (
            <Text style={styles.emptyText}>
              No recipes found for current peak produce.
            </Text>
          )}

          {recipes &&
            recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(recipe.sourceUrl).catch(() => {})}
              >
                {/* Recipe image */}
                {recipe.image && (
                  <Image
                    source={{ uri: recipe.image }}
                    style={styles.recipeImage}
                  />
                )}

                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName} numberOfLines={2}>
                    {recipe.title}
                  </Text>

                  {/* Show which peak ingredients this recipe uses */}
                  {recipe.usedIngredients.length > 0 && (
                    <Text style={styles.ingredientHint}>
                      Uses: {recipe.usedIngredients.join(", ")}
                    </Text>
                  )}

                  <Text style={styles.viewRecipe}>View recipe →</Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.12)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  headerIcon: { fontSize: 18 },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  chevron: { fontSize: 14, color: COLORS.textMuted },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: FONTS.serif,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  // Individual recipe card — horizontal layout with image + text
  recipeCard: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  recipeImage: {
    width: 80,
    height: 80,
  },
  recipeInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  recipeName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: FONTS.serif,
    marginBottom: 4,
  },
  ingredientHint: {
    fontSize: 11,
    color: COLORS.inSeason,
    fontFamily: FONTS.mono,
    marginBottom: 4,
  },
  viewRecipe: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: "500",
  },
});
