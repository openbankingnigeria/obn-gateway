'use client'

import { APIConfigurationProps } from "@/types/webappTypes/appTypes"
import { useState } from "react";

const OnboardingSettingsPage = ({ rawData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>OnboardingSettingsPage</div>
  )
}

export default OnboardingSettingsPage