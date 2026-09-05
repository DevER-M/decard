import { darkTheme } from "@rainbow-me/rainbowkit";

/**
 * Neo-brutalist RainbowKit theme: hard 4px black borders, flat colors, hard
 * 4px offset shadows, no rounded corners — matches the rest of the UI.
 */
export const neoTheme = darkTheme({
  accentColor: "#ff6b6b",
  accentColorForeground: "#000000",
  borderRadius: "none",
  fontStack: "system",
  overlayBlur: "small",
});

neoTheme.colors.connectButtonBackground = "#ffd93d";
neoTheme.colors.connectButtonInnerBackground = "#ffffff";
neoTheme.colors.connectButtonText = "#000000";
neoTheme.colors.modalBackground = "#fffdf5";
neoTheme.colors.modalBorder = "#000000";
neoTheme.colors.modalText = "#000000";
neoTheme.colors.modalTextDim = "rgba(0, 0, 0, 0.55)";
neoTheme.colors.modalTextSecondary = "rgba(0, 0, 0, 0.7)";
neoTheme.colors.generalBorder = "#000000";
neoTheme.colors.generalBorderDim = "rgba(0, 0, 0, 0.2)";
neoTheme.colors.menuItemBackground = "rgba(0, 0, 0, 0.06)";
neoTheme.colors.actionButtonBorder = "rgba(0, 0, 0, 0.1)";
neoTheme.colors.actionButtonBorderMobile = "rgba(0, 0, 0, 0.15)";
neoTheme.colors.actionButtonSecondaryBackground = "rgba(0, 0, 0, 0.06)";
neoTheme.colors.closeButton = "#000000";
neoTheme.colors.closeButtonBackground = "rgba(0, 0, 0, 0.06)";
neoTheme.colors.error = "#ff494a";
neoTheme.colors.profileAction = "rgba(0, 0, 0, 0.06)";
neoTheme.colors.profileActionHover = "rgba(0, 0, 0, 0.1)";
neoTheme.colors.profileForeground = "#fffdf5";
neoTheme.colors.selectedOptionBorder = "#ff6b6b";
neoTheme.colors.standby = "#ffd93d";

neoTheme.shadows.connectButton = "4px 4px 0 0 #000";
neoTheme.shadows.dialog = "8px 8px 0 0 #000";
neoTheme.shadows.profileDetailsAction = "2px 2px 0 0 #000";
neoTheme.shadows.selectedOption = "2px 2px 0 0 #000";
neoTheme.shadows.selectedWallet = "4px 4px 0 0 #000";
neoTheme.shadows.walletLogo = "2px 2px 0 0 #000";
