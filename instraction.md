# 📱 FinTech Mobile Application – Full UI & Flow Specification

## 📌 Project Overview

This document defines the complete UI and flow requirements for a FinTech mobile application built with **Expo (React Native)**. The application must follow a strict step-based onboarding process where users are required to complete each section before accessing the main application.

The implementation must follow:

- ✅ Single Responsibility Principle (SRP)
- ✅ No code duplication
- ✅ Clean and scalable architecture
- ✅ Custom-built components (no built-in dropdowns, date pickers, or modals)
- ✅ Beautiful animations and modern FinTech design standards

---

# 🧭 Application Flow Structure

The application is divided into **four mandatory onboarding sections**, followed by access to the main app.

## Required Flow Order:

1. Welcome
2. Authentication
3. Personal Information & Address
4. KYC Verification
5. Home (Main Application)

### 🚨 Flow Enforcement Rules

- Users **must complete each step sequentially**
- Skipping steps is not allowed
- If a step is incomplete:
  - The user cannot move forward
  - The user cannot access the Home screen
- Route guards must validate completion status before navigation

---

# 🟢 Section 1: Welcome

## Screen Requirements

- Modern onboarding-style UI
- Smooth animations
- Two primary buttons:
  - Login
  - Register

---

# 🔐 Section 2: Authentication

## Login Methods (3 Required)

1. Email & Password
2. Google Authentication
3. Apple Authentication

## Requirements

- Custom-designed input fields
- Proper form validation
- Error handling UI
- Animated transitions
- API integration using:
  - React Query
  - Axios

---

# 👤 Section 3: Personal Information & Address

After successful authentication, the user must complete profile details.

---

## Step 3A: Profile Information

Collect:

- Full Name
- Date of Birth (Custom date picker — no built-in picker)
- Phone Number
- Additional required personal data

---

## Step 3B: Address Information

Collect:

- Country (Custom dropdown)
- City
- Street
- Postal Code
- Additional address fields

### ⚠️ Important

- Do NOT use built-in dropdowns
- Do NOT use built-in date pickers
- All components must be fully custom-built

---

# 🛂 Section 4: KYC Verification

Collect:

- National ID / Passport Number
- Document Upload
- Selfie Upload (if required)
- Additional verification fields

## Requirements

- Custom file upload UI
- Animated progress indicator
- Proper validation before submission

### Access Control

Users can access the Home screen **only after completing KYC successfully**.

---

# 🏠 Main Application (Home Section)

After completing all onboarding steps, users gain access to the main app.

## Bottom Tab Navigation (3 Tabs Required)

### 1️⃣ Home Tab

- Dashboard overview
- Account summary
- Quick action buttons

### 2️⃣ Activity Tab

- Transaction history
- Activity timeline
- Filtering options

### 3️⃣ Account Tab

- User details display
- Settings section
- Theme switch (Light/Dark)
- Additional configuration options

---

# 🛠 Technical Requirements

## 🎨 Styling

- Use **NativeWind**
- Fully responsive layout
- Modern FinTech UI design
- Smooth animations and micro-interactions

## 🔔 Icons

- Use **Lucide Icons**

## 📡 API & Data Management

- React Query for server state
- Axios for API requests
- Proper loading, success, and error states

## 📦 Modals & Gestures

Use:

- react-native-gesture-handler
- react-native-safe-area-context

### Important

- Build fully custom modal components
- Do NOT use built-in modal components

---

# 🏗 Architecture & Code Standards

- Follow Single Responsibility Principle (SRP)
- No duplicated components
- Reusable UI components
- Clear folder structure
- Separation of concerns:
  - UI Components
  - Business Logic
  - API Services
  - Hooks
  - Validation
  - Navigation Guards

---

# ✨ Additional Requirements

- Smooth animated transitions between screens
- Custom dropdown components
- Custom date picker component
- Custom modal system
- Route protection based on onboarding progress
- Persistent onboarding state
- Clean error messaging
- Production-ready UI quality

---

# 🎯 Final Objective

Deliver a fully functional, production-ready UI for a FinTech mobile application that:

- Enforces strict step-based onboarding
- Prevents skipping incomplete steps
- Uses NativeWind for styling
- Uses Lucide for icons
- Uses React Query + Axios for API integration
- Uses only custom-built UI components
- Maintains clean, scalable architecture
