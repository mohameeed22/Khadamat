# Khadamat (خدمات) 🇹🇳

<p align="center">
  <strong>الصنايعي والخدمة في جيبك وين ما تكون</strong><br>
  <em>La plateforme de mise en relation de services et d'artisans en Tunisie</em><br>
  <em>The modern on-demand marketplace connecting Tunisian households with verified local service professionals.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" />
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native 0.86" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/Languages-AR%20%7C%20FR%20%7C%20EN-2563EB?style=for-the-badge" alt="Trilingual Support" />
  <img src="https://img.shields.io/badge/Coverage-24%20Governorates-10B981?style=for-the-badge" alt="Tunisia Coverage" />
</p>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Authentication & Demo Mode](#-authentication--demo-mode)
  - [Instant Demo Testing](#instant-demo-testing)
  - [Connecting Real Firebase](#connecting-real-firebase)
- [Localization & RTL](#-localization--rtl)
- [Supported Service Categories](#-supported-service-categories)
- [Contributing & License](#-contributing--license)

---

## 🌟 About the Project

**Khadamat (خدمات)** is a high-performance cross-platform mobile application developed with **React Native** and **Expo SDK 57**. It addresses the daily friction of discovering, vetting, and contacting skilled local tradespeople in Tunisia—including plumbers, electricians, HVAC/AC technicians, carpenters, painters, appliance repair technicians, and cleaners.

Designed specifically for the Tunisian market, the app offers a native-feeling experience with phone-number authentication (+216), comprehensive trilingual support (Tunisian Arabic, French, and English), full Right-to-Left (RTL) layout switching, and a dual-role workflow (Clients & Professionals).

---

## ⚡ Key Features

- **📱 Tunisian Phone Authentication (+216)**:
  - Frictionless login with mobile phone numbers.
  - SMS OTP verification using Firebase Authentication.
  - Built-in one-click demo bypass with pre-filled test numbers for rapid review and QA.

- **👥 Dual-Mode Role Engine (Client & Provider)**:
  - **Client Mode (حريف)**: Browse service categories, search professionals by name or skill, filter by governorate, review ratings, and initiate calls or WhatsApp inquiries.
  - **Provider Mode (صنايعي / محترف)**: Dedicated professional view with online/offline availability switch, incoming job request feeds, earnings counters, and profile management.
  - Instant role-switch capability without requiring separate logins.

- **🌐 Trilingual & Native RTL Experience**:
  - Full support for **Arabic (العربية)**, **French (Français)**, and **English**.
  - Dynamic RTL (Right-to-Left) UI mirroring for Arabic, with fluid text alignments and mirrored iconography.
  - Instant language switching directly from any screen via a compact language selector.

- **📍 All 24 Tunisian Governorates**:
  - Filter and select services across Tunis, Ariana, Ben Arous, Manouba, Nabeul, Sousse, Monastir, Sfax, Bizerte, Kairouan, and all interior and southern governorates.

- **🎨 Modern Aesthetic & Design System**:
  - Bespoke color palette: Mediterranean Azure (`#1D4ED8`), Emerald Green (`#059669`), and Amber (`#D97706`).
  - Haptic touch feedback, smooth card elevations, soft borders, and accessibility-compliant contrast.
  - Custom responsive buttons, form controls, and badge components.

---

## 🛠 Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Expo SDK 57](https://expo.dev) | React Native managed workflow with Metro bundler |
| **Core** | [React Native 0.86](https://reactnative.dev) / React 19 | New architecture enabled, native performance |
| **Icons** | `@expo/vector-icons` (Ionicons) | Vector iconography with dynamic RTL transformation |
| **Storage** | `@react-native-async-storage/async-storage` | Local persistence for user profile, role, and language preferences |
| **Backend / Auth** | [Firebase v12](https://firebase.google.com) | Phone Auth with local simulated development fallback |
| **Styling** | Vanilla React Native `StyleSheet` | Clean, high-performance tokens (`COLORS`, `SPACING`, `RADIUS`, `SHADOWS`) |

---

## 📂 Project Directory Structure

```text
khadmat/
├── assets/                  # App icons, splash screens, and adaptive assets
├── src/
│   ├── components/          # Reusable, design-system compliant UI components
│   │   ├── Button.js        # Configurable buttons (primary, secondary, outline, text)
│   │   ├── Header.js        # Navigation headers with back controls & language pills
│   │   ├── Input.js         # Text and phone inputs with prefix & error states
│   │   └── LanguageSelector.js # Language dropdown / modal toggle (AR, FR, EN)
│   ├── config/
│   │   └── firebase.js      # Firebase App & Auth initialization + readiness check
│   ├── constants/
│   │   ├── theme.js         # Typography, color tokens, margins, radii, & shadows
│   │   └── translations.js  # Trilingual dictionary, governorate lists & categories
│   ├── context/
│   │   ├── AuthContext.js   # Global authentication state, role state, and profile data
│   │   └── LanguageContext.js # Multi-language state with automatic RTL alignment
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js         # Phone input screen (+216) & quick demo trigger
│   │   │   ├── OtpVerifyScreen.js     # 6-digit verification code with resend timer
│   │   │   ├── RoleSelectScreen.js    # Client vs. Provider onboarding step
│   │   │   └── ProfileSetupScreen.js  # Name, governorate, services, & bio setup
│   │   └── HomeScreen.js              # Dual-mode dashboard (Client & Provider view)
│   └── services/
│       └── firebaseAuth.js  # Phone OTP service with seamless mock fallback
├── App.js                   # Root component with provider stack & stage navigator
├── app.json                 # Expo project manifest & mobile configuration
├── package.json             # NPM dependencies and scripts
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or later recommended
- **npm** or **yarn** package manager
- **Expo Go** application on your physical iOS/Android device, or an active Android Emulator / iOS Simulator.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/khadmat.git
   cd khadmat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Locally

Start the Expo development server:

```bash
npx expo start
```

Use the terminal shortcuts or scan the QR code:
- Press **`a`** to open on an Android emulator / connected device.
- Press **`i`** to open on iOS simulator (macOS required).
- Press **`w`** to run in your desktop web browser.

---

## 🔐 Authentication & Demo Mode

### Instant Demo Testing

Khadamat comes pre-configured with a zero-friction **Simulated Phone Verification Mode**. You can explore the entire user journey immediately without setting up Google Cloud or Firebase billing:

1. On the **Login Screen**, tap **"دخول سريع تجريبي" (Quick Demo Login)** or input any 8-digit number (e.g. `20123456`).
2. On the **OTP Screen**, enter:
   ```text
   123456
   ```
3. The session will automatically authenticate and guide you through Role Selection (`Client` or `Provider`) and Profile Setup.

### Connecting Real Firebase

To enable live SMS delivery via Google Firebase:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** → **Sign-in method** → **Phone**.
3. Register a Web App in your Firebase Project Settings.
4. Update `src/config/firebase.js` with your project credentials:
   ```javascript
   export const FIREBASE_CONFIG = {
     apiKey: 'AIzaSyYourRealApiKeyHere',
     authDomain: 'your-project.firebaseapp.com',
     projectId: 'your-project',
     storageBucket: 'your-project.appspot.com',
     messagingSenderId: '123456789012',
     appId: '1:123456789012:web:abcdef123456',
   };
   ```
5. When valid credentials are detected, the app automatically switches from the simulated service to live Firebase Phone Authentication.

---

## 🌍 Localization & RTL

Translations are organized in `src/constants/translations.js`:

```javascript
import { useLanguage } from './src/context/LanguageContext';

const MyComponent = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();

  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Text>{t('appName')}</Text>
    </View>
  );
};
```

Supported locales:
- `ar`: Arabic (العربية) — Default RTL layout
- `fr`: French (Français) — LTR
- `en`: English — LTR

---

## 🔨 Supported Service Categories

| Arabic | French | English | Icon |
| :--- | :--- | :--- | :--- |
| سباكة (بلومبيي) | Plomberie | Plumbing | `water` |
| كهرباء (تريسيان) | Électricité | Electrical | `flash` |
| تكييف وتبريد (كليماتيزور) | Climatisation | HVAC / AC | `snow` |
| نجارة وموبيليا | Menuiserie | Carpentry | `hammer` |
| دهان وزينة | Peinture | Painting | `color-palette` |
| تنظيف منزلي | Nettoyage | Cleaning | `sparkles` |
| تصليح أجهزة كهرومنزلية | Électroménager | Appliance Repair | `tv` |
| ميكانيك وديباناج | Mécanique & Dépannage | Auto Mechanic | `car` |
| حدادة وألمنيوم | Ferronnerie | Metalwork | `construct` |
| بستنة وعناية بالحدائق | Jardinage | Gardening | `leaf` |

---

## 📄 Contributing & License

Contributions are welcome! If you'd like to improve features or translations:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

<p align="center">
  Crafted with ❤️ for Tunisia 🇹🇳
</p>
