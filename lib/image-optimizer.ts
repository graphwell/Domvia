/**
 * Utilitário para otimização de imagens 360 (equirretangulares)
 * Reduz dimensões excessivas e aplica compressão para uploads mais rápidos.
 */

interface OptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

export async function optimizeImage(
    file: File,
    options: OptimizationOptions = { maxWidth: 4096, maxHeight: 2048, quality: 0.8 }
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const { maxWidth = 6000, maxHeight = 3000, quality = 0.85 } = options;

                // Manter proporção 2:1 (padrão equirretangular)
                // Se a imagem for muito grande, reduzimos mantendo a proporção
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / 2;
                }

                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * 2;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Não foi possível criar o contexto do Canvas"));
                    return;
                }

                // Desenha a imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Converte para Blob (JPEG costuma ser melhor para fotos panorâmicas)
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const optimizedFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(optimizedFile);
                        } else {
                            reject(new Error("Falha na conversão do Canvas para Blob"));
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = () => reject(new Error("Falha ao carregar imagem"));
        };

        reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    });
}
