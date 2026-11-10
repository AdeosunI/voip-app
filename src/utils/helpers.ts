export const handleDownload = (data: Blob, suggestedName: string) => {
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");

  link.href = url;
  link.download = suggestedName;
  link.click();

  URL.revokeObjectURL(url);
};
