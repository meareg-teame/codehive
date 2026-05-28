import { BrowserRouter, Route, Routes } from "react-router-dom";
import Hero from "@/components/Hero";
import Auth from "@/components/Auth";
import Dashboard from "@/components/Dashboard";
import Editor from "@/components/Editor";
import SharedWithMe from "@/components/SharedWithMe";
import AccessManagement from "@/components/AccessManagement";
import Analytics from "@/components/Analytics";
import ProfilePage from "@/components/ProfilePage";
import SecurityPage from "@/components/SecurityPage";
import PreferencesPage from "@/components/PreferencesPage";
import JoinPage from "@/features/team/pages/JoinPage";
import { RequireAuth } from "./layouts/RequireAuth";
import { AppLayout } from "./layouts/AppLayout";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/join/:token" element={<JoinPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shared-with-me" element={<SharedWithMe />} />
            <Route path="/access-management" element={<AccessManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Route>
          <Route path="/editor/:projectId" element={<Editor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
