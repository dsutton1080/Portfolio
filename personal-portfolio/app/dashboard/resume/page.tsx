"use client";
import React, { useEffect, useState } from "react";
import { getAllSections } from "../../services";

// Modular block component
[
  {
    title: "STEM Experience",
    header: "Black Data Processing Association",
    subHeader: "National Programming Team, Project Manager, 2013-2017",
    contents: [
      {
        content:
          "Created backend portion of website for national competition and served as project manager for the team.",
      },
    ],
  },
];
type SectionData = {
  title: string;
  header?: string;
  subHeader?: string;
  contents: { content: string }[];
};

const Block = ({ title, header, subHeader, contents }: SectionData) => {
  return (
    <div>
      <h1>{title}</h1>
      <h2>{header}</h2>
      <h4>{subHeader}</h4>

      {contents && contents.map((item, index) => <p key={index}>{item.content}</p>)}
    </div>
  );
};

// Resume component
function Resume() {
  const [data, setData] = useState<SectionData[]>([]);

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
        console.log("setting data");
        setData(sections);
      }
    };

    fetchSections();
  }, [data]);

  return (
    <div>
      {data.map((item, index) => (
        <Block
          key={index}
          title={item.title}
          header={item.header}
          subHeader={item.subHeader}
          contents={item.contents}
        />
      ))}
    </div>
  );
}

export default React.memo(Resume);
