export const driveService = {
    // Upload file to Google Drive using multipart upload with a provided access token
    uploadFileWithToken: async (file, accessToken) => {
        try {
            const metadata = {
                name: file.name,
                mimeType: file.type,
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webContentLink', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload to Drive failed');
            }

            const data = await response.json();

            if (!data.id) {
                throw new Error('Upload failed: No file ID returned');
            }

            // Make the file publicly accessible so anyone with the link can view/play it
            const permResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
                method: 'POST',
                headers: new Headers({
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone'
                })
            });

            if (!permResponse.ok) {
                console.warn('Failed to set public permissions on uploaded file');
            }

            return data.webContentLink || `https://drive.google.com/uc?export=download&id=${data.id}`;
        } catch (error) {
            console.error('Error uploading to Google Drive:', error);
            throw error;
        }
    }
};
