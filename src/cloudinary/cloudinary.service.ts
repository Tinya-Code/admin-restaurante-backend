import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // Configurar Cloudinary con las credenciales
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Subir imagen a Cloudinary desde base64
   * @param imageBase64 - Imagen en formato base64 (data:image/png;base64,...)
   * @param folder - Carpeta en Cloudinary donde guardar (ej: 'products')
   * @returns Objeto con información de la imagen subida
   */
  async uploadImage(
    imageBase64: string,
    folder: string = 'products',
  ): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder: `restaurant/${folder}`, // restaurant/products
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Máximo 800x800
          { quality: 'auto' }, // Calidad automática
          { fetch_format: 'auto' }, // WebP si es soportado
        ],
      });

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Error al subir imagen a Cloudinary: ${error.message}`,
      );
    }
  }

  /**
   * Eliminar imagen de Cloudinary
   * @param imageUrl - URL completa de Cloudinary
   * Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234/restaurant/products/abc123.jpg
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el public_id de la URL
      const publicId = this.extractPublicId(imageUrl);
      
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Error al eliminar imagen de Cloudinary:', error.message);
      // No lanzar error para no interrumpir operaciones críticas
    }
  }

  /**
   * Extraer public_id de una URL de Cloudinary
   * @param imageUrl - URL de Cloudinary
   * @returns public_id o null
   */
  private extractPublicId(imageUrl: string): string | null {
    try {
      // URL ejemplo: https://res.cloudinary.com/demo/image/upload/v1234/restaurant/products/abc123.jpg
      const parts = imageUrl.split('/upload/');
      if (parts.length !== 2) return null;

      // Obtener la parte después de /upload/
      const afterUpload = parts[1];
      
      // Remover versión (v1234/) si existe
      const withoutVersion = afterUpload.replace(/^v\d+\//, '');
      
      // Remover extensión (.jpg, .png, etc)
      const publicId = withoutVersion.replace(/\.[^.]+$/, '');
      
      return publicId;
    } catch (error) {
      console.error('Error extrayendo public_id:', error);
      return null;
    }
  }

  /**
   * Obtener información de una imagen
   * @param publicId - ID público de la imagen
   */
  async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener información de imagen: ${error.message}`,
      );
    }
  }
}