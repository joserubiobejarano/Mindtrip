import React from "react";

type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  id?: string;
};

export function StructuredData({ data, id }: StructuredDataProps) {
  const json = JSON.stringify(data);

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
