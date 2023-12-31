"use client";

import React, { useState } from "react";

function AddSection() {
  const [title, setTitle] = useState("");
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [contents, setContents] = useState([""]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleHeaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeader(event.target.value);
  };

  const handleSubHeaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubHeader(event.target.value);
  };

  const handleContentChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContents = [...contents];
    newContents[index] = event.target.value;
    setContents(newContents);
  };

  const handleAddContent = () => {
    setContents([...contents, ""]);
  };

  const handleDeleteContent = (index: number) => {
    const newContents = [...contents];
    newContents.splice(index, 1);
    setContents(newContents);
  };

  const handleReset = () => {
    setTitle("");
    setHeader("");
    setSubHeader("");
    setContents([""]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(title, header, subHeader, contents);

    // handleReset();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6"></div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Add a new Section</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            A section consists of a required Title, optional Header, optional SubHeader, and
            optional content.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                Title
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  autoComplete="off"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="header" className="block text-sm font-medium leading-6 text-gray-900">
                Header
              </label>
              <div className="mt-2">
                <input
                  id="header"
                  name="header"
                  type="text"
                  autoComplete="off"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="subheader"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                SubHeader
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="subheader"
                  id="subheader"
                  autoComplete="off"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {contents.map((content, index) => (
              <div className="col-span-full" key={index}>
                <div className="flex justify-between items-center">
                  <label
                    htmlFor={`content-${index}`}
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Content {index + 1}
                  </label>
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteContent(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Content"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <textarea
                    id={`content-${index}`}
                    name={`content-${index}`}
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={content}
                    onChange={(event) => handleContentChange(index, event)}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddContent}
              className="text-black-500 hover:text-black-700"
              title="Add Content"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v12m-6-6h12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSection;
