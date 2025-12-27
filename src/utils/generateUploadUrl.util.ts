//! Generate AWS Signed URL for cover to handle the upload functionality in the frontend
//!We'll use the aws-sdk to generate the signed URL
//! We'll do it for deployment stage and for now we just create dummy upload url and file key

const dummyUploadUrlGenerator = (fileName: string, fileType: string) => {
  return {
    uploadUrl: `https://dummy-upload-url.com/${fileName}`,
    fileKey: `dummy-file-key/${fileName}`,
  };
};

export default dummyUploadUrlGenerator;
