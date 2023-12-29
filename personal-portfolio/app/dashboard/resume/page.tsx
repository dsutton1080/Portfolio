"use client";

import React, { useEffect, useState } from "react";
import { getAllSections } from "../../services";

type ContentData = {
  content: string;
};

type SectionData = {
  title: string;
  header?: string;
  subHeader?: string;
  contents: ContentData[];
};

type Sections = {
  [key: string]: SectionData[];
};

// Modular block component
const Block = ({ title, header, subHeader, contents }: SectionData) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>{header}</h2>
      <h4>{subHeader}</h4>

      {contents && contents.map((item, index) => <p key={index}>{item.content}</p>)}
    </div>
  );
};

// Resume component
function Resume() {
  const [data, setData] = useState<Sections>({});

  useEffect(() => {
    const fetchSections = async () => {
      const sections = await getAllSections()
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
      if (JSON.stringify(sections) != JSON.stringify(data)) {
        console.log(sections);
        setData(sections);
      }
    };

    fetchSections();
  }, [data]);

  return (
    <div>
      {data &&
        typeof data === "object" &&
        Object.keys(data).map((sectionName) => (
          <div key={sectionName}>
            <h2>{sectionName}</h2>
            {data[sectionName].map((sectionData, index) => (
              <Block key={index} {...sectionData} />
            ))}
          </div>
        ))}
    </div>
  );
}

export default React.memo(Resume);
