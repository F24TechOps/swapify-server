import os from "os";
import path from "path";
import fs from "fs";

const tempDir = os.tmpdir();

export function deleteCompany(company) {
    const swapifyTempDir = path.join(tempDir, 'swapify_temp_dir');
    const companyDir = path.join(swapifyTempDir, company);

    if (fs.existsSync(companyDir)) {
        fs.rmdirSync(companyDir, { recursive: true });
        console.log(`Deleted company directory: ${companyDir}`);
    } else {
        console.log(`Company directory does not exist: ${companyDir}`);
    }
}

export function getTmpDir () {
    return tempDir;
}

export function getCompanies () {
    const swapifyTempDir = path.join(tempDir, 'swapify_temp_dir');
    console.log(swapifyTempDir, 'swapify_temp_dir');

    if (!fs.existsSync(swapifyTempDir)) {
        console.log('Directory does not exist.');
        return [];
    }

    const folders = fs.readdirSync(swapifyTempDir).filter(file => {
        return fs.statSync(path.join(swapifyTempDir, file)).isDirectory();
    });

    return folders;
}