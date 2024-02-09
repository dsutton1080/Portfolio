import axios from 'axios'

const url = 'https://api-portfolio-ulch.onrender.com'

const getAllSections = async () => {
  return axios
    .get(url + '/section/all')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const getSectionById = async (sectionId: any) => {
  return axios
    .get(url + `/section/${sectionId}`)
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const addSection = async (section: any) => {
  return axios
    .post(url + '/section', section)
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const updateSection = async (sectionId: any, section: any) => {
  return axios
    .patch(url + `/section/${sectionId}`, section)
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const deleteSection = async (sectionId: any) => {
  return axios
    .delete(url + `/section/${sectionId}`)
    .then((response) => response)
    .catch((error) => console.error(error))
}

const getSectionCount = async () => {
  return axios
    .get(url + '/section/count')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const getHeaders = async () => {
  return axios
    .get(url + '/section/headers')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const getExperiences = async () => {
  return axios
    .get(url + '/experience/all')
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

const addExperience = async (experience: any) => {
  return axios
    .post(url + '/experience', experience)
    .then((response) => response.data)
    .catch((error) => console.error(error))
}

export {
  getAllSections,
  getSectionById,
  addSection,
  updateSection,
  deleteSection,
  getSectionCount,
  getHeaders,
  getExperiences,
  addExperience,
}
