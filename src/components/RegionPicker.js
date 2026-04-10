/**
 * RegionPicker — modal that lets users choose a city/region or use their
 * device location. Selecting a region triggers onSelect with { latitude,
 * longitude } so the parent can fetch weather and update the display.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { COLORS, FONTS } from "../utils/theme";

// Preset regions spanning different climate zones. Each entry includes
// coordinates so we can fetch weather and compute the correct climate shift.
const REGIONS = [
  // North America
  { name: "New York, NY", latitude: 40.71, longitude: -74.01 },
  { name: "Los Angeles, CA", latitude: 34.05, longitude: -118.24 },
  { name: "Chicago, IL", latitude: 41.88, longitude: -87.63 },
  { name: "Miami, FL", latitude: 25.76, longitude: -80.19 },
  { name: "Seattle, WA", latitude: 47.61, longitude: -122.33 },
  { name: "Denver, CO", latitude: 39.74, longitude: -104.99 },
  { name: "Dallas, TX", latitude: 32.78, longitude: -96.80 },
  { name: "Atlanta, GA", latitude: 33.75, longitude: -84.39 },
  { name: "Portland, OR", latitude: 45.52, longitude: -122.68 },
  { name: "Phoenix, AZ", latitude: 33.45, longitude: -112.07 },
  // International — different hemispheres and climate zones
  { name: "London, UK", latitude: 51.51, longitude: -0.13 },
  { name: "Sydney, AU", latitude: -33.87, longitude: 151.21 },
  { name: "São Paulo, BR", latitude: -23.55, longitude: -46.63 },
  { name: "Tokyo, JP", latitude: 35.68, longitude: 139.69 },
  { name: "Cape Town, ZA", latitude: -33.93, longitude: 18.42 },
];

export default function RegionPicker({ visible, onClose, onSelect, onUseMyLocation }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Region</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* "Use My Location" button — prominent at the top */}
          <TouchableOpacity
            style={styles.myLocationBtn}
            activeOpacity={0.7}
            onPress={() => {
              onUseMyLocation();
              onClose();
            }}
          >
            <Text style={styles.myLocationIcon}>📍</Text>
            <Text style={styles.myLocationText}>Use My Location</Text>
          </TouchableOpacity>

          {/* Divider with label */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OR PICK A CITY</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Scrollable list of preset regions */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {REGIONS.map((region) => (
              <TouchableOpacity
                key={region.name}
                style={styles.regionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(region);
                  onClose();
                }}
              >
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionCoords}>
                  {region.latitude.toFixed(1)}°, {region.longitude.toFixed(1)}°
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Semi-transparent backdrop that dims the content behind the modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  // Bottom sheet container — rounded top corners, capped at 70% screen height
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  closeBtn: {
    fontSize: 20,
    color: COLORS.textMuted,
    padding: 4,
  },
  // Prominent "Use My Location" button styled like a pill
  myLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  myLocationIcon: {
    fontSize: 18,
  },
  myLocationText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    fontFamily: FONTS.serif,
  },
  // "OR PICK A CITY" divider between location button and city list
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.separator,
  },
  dividerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  list: {
    paddingHorizontal: 24,
  },
  regionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  regionName: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: FONTS.serif,
    fontWeight: "500",
  },
  regionCoords: {
    fontSize: 12,
    color: COLORS.textFaint,
    fontFamily: FONTS.mono,
  },
});
