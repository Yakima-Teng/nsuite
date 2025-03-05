export const getSafeFileName = (fileName) => {
  return fileName.replace(/[+\s?？！@#￥%…&*（）=·~!$^()/<>,;':"[\]{}]/g, "_");
};
