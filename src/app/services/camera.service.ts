// camera.service.ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from 'src/app/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  async takePhoto(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90,
      });
      return photo.base64String!;
    } catch (err) {
      console.error('Error taking photo', err);
      return null;
    }
  }

  async uploadToSupabase(base64: string, userId: string): Promise<string> {
    const fileName = `${userId}_${Date.now()}.jpeg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, base64, {
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  }
}
