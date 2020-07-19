import { FileDocument } from "./file.model";

export const addFileNameExtension = (fileName: string, extension: string) => {
  if (!fileName) return;

  if (extension.startsWith(".")) {
    extension = extension.substring(1);
  }

  const lastDot = fileName.lastIndexOf(".");

  if (lastDot !== -1) {
    const name = fileName.substr(0, lastDot);

    return `${name}.${extension}`;
  } else {
    return `${fileName}.${extension}`;
  }
};

export const addFileNameSuffix = (fileName: string, suffix: string) => {
  if (!fileName) return;

  const lastDot = fileName.lastIndexOf(".");

  if (lastDot !== -1) {
    const name = fileName.substring(0, lastDot);
    const extension = fileName.substring(lastDot + 1);
    return `${name}${suffix}.${extension}`;
  } else {
    return `${fileName}${suffix}`;
  }
};

export const findUniqueFileName = (files: FileDocument[], fileName: string) => {
  let newFileName = fileName;
  let suffix = 0;

  while (findFileByFileName(files, fileName) !== undefined) {
    fileName = addFileNameSuffix(newFileName, ` (${++suffix})`);
  }

  return fileName;
};

export const findFileByFileName = (files: FileDocument[], fileName: string) => {
  return files.find(item => item.name.toLowerCase() === fileName.toLowerCase());
};

export const isImageFile = (option: { dataURL?: string; type?: string }) => {
  let isImageFile = false;

  if (option) {
    if (option.type && option.type.startsWith("image/")) {
      isImageFile = true;
    } else if (option.dataURL && option.dataURL.startsWith("data:image/")) {
      isImageFile = true;
    }
  }

  return isImageFile;
};
