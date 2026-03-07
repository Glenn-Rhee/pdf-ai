"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function UpgradeButton() {
  return (
    <Button>
      Upgrade Now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
}
