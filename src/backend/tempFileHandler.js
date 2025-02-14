import os from "os";

const tempDir = os.tmpdir();
const companies = [];

export function addCompany (company) {
    companies.push(company);
}

export function deleteCompany (company) {
    const index = companies.indexOf(company);
    if (index !== -1)
        companies.splice(index, 1);
}

export function getTmpDir () {
    return tempDir;
}

export function getCompanies () {
    return companies;
}