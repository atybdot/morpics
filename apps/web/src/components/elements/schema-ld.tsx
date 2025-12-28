import { schemaLd } from "./site-metadata";

export function SchemaLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLd) }}
    />
  );
}
