import os from "os";

const tempDir = os.tmpdir();
const companies = [];

export function addCompany (company) {
    companies.push(company);
}

export function getTmpDir () {
    return tempDir;
}

export function getCompanies () {
    return companies;
}