import { aiDiscoverabilityData, faqSchema } from "./ai-discoverability-data";

export function AIStructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aiDiscoverabilityData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
