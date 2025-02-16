import core from 'core';

export async function getFileAttachments() {
  const attachments = {
    fileAttachmentAnnotations: [],
    embeddedFiles: [],
  };
  if (!core.isFullPDFEnabled()) {
    console.warn('Need fullAPI to be on to view embedded files.');
  } else {
    const PDFNet = window.Core.PDFNet;
    let doc = core.getDocument();
    if (doc) {
      doc = await doc.getPDFDoc();
    }
    const main = async () => {
      const files = await PDFNet.NameTree.find(doc, 'EmbeddedFiles');
      if (files && (await files.isValid())) {
        // Traverse the list of embedded files.
        const fileItr = await files.getIteratorBegin();
        for (let counter = 0; await fileItr.hasNext(); await fileItr.next(), ++counter) {
          const filesIteratorValue = await fileItr.value();
          const fileObject = await filesIteratorValue.get('F');
          const fileData = await fileObject.value();
          const filename = await fileData.getAsPDFText();
          attachments.embeddedFiles.push({
            filename,
            fileObject: filesIteratorValue
          });
        }
      }
    };

    // doc will be undefined for non-pdf files
    if (doc) {
      await PDFNet.runWithCleanup(main);
    }
  }
  const fileAttachmentAnnotations = core
    .getAnnotationsList()
    .filter((annot) => annot instanceof window.Core.Annotations.FileAttachmentAnnotation);

  // re-order fileAttachment annotations by page number
  fileAttachmentAnnotations.forEach((annot) => {
    if (!attachments.fileAttachmentAnnotations[annot.PageNumber]) {
      attachments.fileAttachmentAnnotations[annot.PageNumber] = [];
    }
    attachments.fileAttachmentAnnotations[annot.PageNumber].push(annot);
  });
  return attachments;
}

export async function getEmbeddedFileData(iterator) {
  const PDFNet = window.Core.PDFNet;
  const fileSpec = await PDFNet.FileSpec.createFromObj(iterator);
  const stm = await fileSpec.getFileData();
  const filterReader = await PDFNet.FilterReader.create(stm);
  const dataArray = [];
  const chunkLength = 1024;
  let retrievedLength = chunkLength;
  while (chunkLength === retrievedLength) {
    const bufferSubArray = await filterReader.read(chunkLength);
    retrievedLength = bufferSubArray.length;
    dataArray.push(bufferSubArray);
  }
  const buffer = new Uint8Array(dataArray.length * chunkLength + retrievedLength);
  for (let i = 0; i < dataArray.length; i++) {
    const offset = i * chunkLength;
    const currentArr = dataArray[i];
    buffer.set(currentArr, offset);
  }
  const blob = new Blob([buffer]);
  return blob;
}