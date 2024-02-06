import axios from 'axios'

const url = 'http://localhost:8080'

const getAllSections = async () => {
  return axios
    .get(url + '/section/all')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const addSection = async (section: any) => {
  return axios
    .post(url + '/section', section)
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const updateSection = async (section: any) => {
  return axios
    .patch(url + '/section', section)
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const deleteSection = async (sectionId: any) => {
  return axios
    .delete(url + `/section?sectionId=${sectionId}`)
    .then((response) => response)
    .catch((error) => console.error(error))
}

const getSectionCount = async () => {
  return axios
    .get(url + '/section/count')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const getExperiences = async () => {
  return axios
    .get(url + '/experience/all')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

export {
  getAllSections,
  addSection,
  updateSection,
  deleteSection,
  getSectionCount,
  getExperiences,
}
