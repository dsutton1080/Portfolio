import axios from "axios";

const getAllSections = async () => {
  return axios
    .get("http://localhost:8080/status")
    .then((response) => response.data)
    .catch((error) => console.error(error));
};

export { getAllSections };
