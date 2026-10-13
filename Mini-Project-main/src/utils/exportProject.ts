import JSZip from 'jszip';

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();
  zip.file(
    'README.txt',
    'Gatherly - Centralized Campus Event Management Platform\nExport generated from application.'
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gatherly-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
