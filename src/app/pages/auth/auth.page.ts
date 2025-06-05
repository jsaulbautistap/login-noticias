import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { supabase } from 'src/app/supabase.client';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  email = '';
  password = '';
  error = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor(private router: Router) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadToSupabase(file: File, userId: string): Promise<string | null> {
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
  
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });
  
    if (error) {
      console.error('Error al subir imagen:', error.message);
      return null;
    }
  
    const { data: publicUrlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);
  
    return publicUrlData.publicUrl;
  }
  
  async register() {
    const { data, error } = await supabase.auth.signUp({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.error = error.message;
      return;
    }

    const user = data.user;
    if (!user) return;

    let fotoPerfilUrl = null;

    if (this.selectedFile) {
      fotoPerfilUrl = await this.uploadToSupabase(this.selectedFile, user.id);
    }

    await supabase.from('profiles').upsert({
      id: user.id,
      nombre: user.email,
      fotoPerfil: fotoPerfilUrl,
    });

    alert('Registro exitoso. Verifica tu email.');
  }

  async login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });
  
    if (error) {
      this.error = error.message;
      return;
    }
  
    const user = data.user;
    if (!user) return;
  
    if (this.selectedFile) {
      const fotoPerfilUrl = await this.uploadToSupabase(this.selectedFile, user.id);
  
      await supabase
        .from('profiles')
        .update({ fotoPerfil: fotoPerfilUrl })
        .eq('id', user.id);
    }
  
    this.router.navigate(['/home']);
  }
}
