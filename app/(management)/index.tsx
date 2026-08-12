import { router } from "expo-router";
import { useEffect } from "react";

export default function ManagementHome() {
  useEffect(() => {
    router.replace("/(management)/crm");
  }, []);

  return null;
}