"use client";

import React, { useEffect, useState } from "react";
import { getAllSections } from "../../services";

type ContentData = {
  content: string;
};

type SectionData = {
  id: number;
  title: string;
  header?: string;
  subHeader?: string;
  contents: ContentData[];
};

type Sections = {
  [key: string]: SectionData[];
};

// Modular block component
const Block = ({ header, subHeader, contents }: SectionData) => {
  return (
    <div className="mb-5">
      <h2 className="text-2xl">{header}</h2>
      <h3 className="text-1xl italic">{subHeader}</h3>
      <ul className="list-none list-inside">
        {contents &&
          contents.map((item, index) => (
            <li key={index} className="text-base ml-4 mb-1">
              {item.content}
            </li>
          ))}
      </ul>
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
            <h1 className="text-4xl font-bold">{sectionName}</h1>
            {data[sectionName].map((sectionData, index) => (
              <Block key={index} {...sectionData} />
            ))}
          </div>
        ))}
    </div>
  );
}

export default Resume;
