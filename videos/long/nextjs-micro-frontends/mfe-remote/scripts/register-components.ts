// This script registers MFE web components in the browser
// It should be loaded from the MFE Remote application

import Counter from '../components/Counter';
import UserProfile from '../components/UserProfile';
import { createWebComponent } from '../lib/webComponentWrapper';

// Register web components
if (typeof window !== 'undefined') {
  createWebComponent(Counter, "mfe-counter", []);
  createWebComponent(UserProfile, "mfe-user-profile", ["initialName", "initialEmail"]);
  console.log("MFE web components registered from external script");
}
