/**
 * Utilitário de Upload para o Cloudinary
 * Utiliza o endpoint REST para uploads "Unsigned" (sem necessidade de chave secreta no client).
 */

export async function uploadToCloudinary(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "leadbroker";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "leadbroker_unsigned";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "tours");

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                resolve(response.secure_url);
            } else {
                console.error("Cloudinary upload error:", xhr.responseText);
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.error?.message || "Erro no upload para Cloudinary"));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Erro de conexão com o Cloudinary"));
        };

        xhr.send(formData);
    });
}
