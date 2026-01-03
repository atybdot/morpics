import { nanoid } from "nanoid";
import React from "react";
import { PiCheck, PiChecks, PiLink, PiUpload } from "react-icons/pi";
import { CardAlt, CardContentAlt, CardHeaderAlt } from "../ui/card";

function HowItWorksGrid() {
  const steps = [
    {
      h: "Upload Your Image",
      d: "Start by uploading your image to our platform.",
      i: <PiUpload size={32} className="mb-4" />,
    },
    {
      h: "Get Public Link",
      d: "Copy the public link from the dashboard",
      i: <PiLink size={32} className="mb-4" />,
    },
    {
      h: "Use it",
      d: "Use the link with URL parameters to generate images on the fly.",
      i: <PiChecks size={32} className="mb-4" />,
    },
  ];
  return (
    <>
      {steps.map((step, index) => (
        <CardAlt key={nanoid()} className="p-0 w-full">
          <CardHeaderAlt className="bg-background border-b-2 border-dashed text-muted-foreground">
            step {index + 1}
          </CardHeaderAlt>
          <CardContentAlt className="p-8">
            {step.i}
            <h3 className="text-lg font-semibold mb-2">{step.h}</h3>
            <p className="text-sm text-muted-foreground">{step.d}</p>
          </CardContentAlt>
        </CardAlt>
      ))}
    </>
  );
}

export default HowItWorksGrid;
