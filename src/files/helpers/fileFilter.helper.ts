export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

  // evaluar existencia del archivo
  if (!file) {
    return callback(new Error('File is empty'), false);
  }

  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  // evaluar formato del archivo
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  } else {
    callback(null, false);
  }

};