"use client";
import React, { useEffect, useState } from "react";
import { getAllSections } from "../../services";

// Modular block component
const Block = ({ header, content }: { header: string; content: string }) => {
  return (
    <div>
      <h2>{header}</h2>
      <p>{content}</p>
    </div>
  );
};

// Resume component
function Resume() {
  console.log("Resume rendered");
  const [data, setData] = useState<{ header: string; content: string }[]>([]);

  useEffect(() => {
    const fetchSections = async () => {
      const sections = await getAllSections()
        .then((response) => {
          console.log(response);
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
      if (JSON.stringify(sections) == JSON.stringify(data)) {
        //Change to !=
        setData(sections);
      }
    };

    fetchSections();
  }, [data]);

  // return (
  //     <div>
  //         {data.map((item, index) => (
  //             <Block key={index} header={item.header} content={item.content} />
  //         ))}
  //     </div>
  // );

  return (
    <div>
      <Block
        header="Experience"
        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      />
      <Block
        header="Education"
        content="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      />
      <Block
        header="Skills"
        content="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      />
    </div>
  );
}

export default React.memo(Resume);
