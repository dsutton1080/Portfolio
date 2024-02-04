import axios from "axios";

const getAllSections = async () => {
  return axios
    .get("http://localhost:8080/section/all")
    .then((response) => response.data)
    .catch((error) => console.error(error));
};

const addSection = async (section: any) => {
  return axios
    .post("http://localhost:8080/section", section)
    .then((response) => response.data)
    .catch((error) => console.error(error));
};

const updateSection = async (section: any) => {
  return axios
    .patch("http://localhost:8080/section", section)
    .then((response) => response.data)
    .catch((error) => console.error(error));
};

const deleteSection = async (sectionId: any) => {
  return axios
    .delete(`http://localhost:8080/section?sectionId=${sectionId}`)
    .then((response) => response)
    .catch((error) => console.error(error));
};

const getSectionCount = async () => {
  return axios
    .get("http://localhost:8080/section/count")
    .then((response) => response.data)
    .catch((error) => console.error(error));
};

export { getAllSections, addSection, updateSection, deleteSection, getSectionCount };
