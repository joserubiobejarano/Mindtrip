# EAS Setup Guide

## First iOS dev build after Apple Developer enrollment

To create your first iOS development build after enrolling in the Apple Developer Program, follow these steps:

1. Run the EAS login command:
```bash
npm run eas:login
```
   This will prompt you to log in with your Expo account.

2. Initiate the iOS development build process:
```bash
npm run eas:build:dev:ios
```
   EAS will guide you through the process, prompting for your Apple credentials and assisting with provisioning profiles. Ensure you have the necessary access to your Apple Developer account.
