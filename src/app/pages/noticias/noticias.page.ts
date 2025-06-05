import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { supabase } from 'src/app/supabase.client';
import {IonicModule}  from '@ionic/angular'
@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, FormsModule, IonItem, IonInput, IonButton, IonicModule
  ]
})
export class NoticiasPage implements OnInit { 

  titulo: string = '';
  contenido: string = '';
  imagenPerfil: string = '';
  nombreUsuario: string = '';
  noticias: any[] = [];

  constructor() { }

  async ngOnInit() {
    await this.cargarNoticias();
  }

  async cargarNoticias() {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error al cargar noticias:', error.message);
      return;
    }

    this.noticias = data || [];
  }

  async publicarNoticia() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error al obtener usuario:', userError?.message);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      console.error('Error al obtener perfil:', perfilError?.message);
      return;
    }

    const { error: insertError } = await supabase.from('noticias').insert([{
      usuario_id: user.id,
      titulo: this.titulo,
      contenido: this.contenido,
      imagen_perfil: perfil.avatar_url,
      nombre_usuario: perfil.name
    }]);

    if (insertError) {
      console.error('Error al publicar noticia:', insertError.message);
      return;
    }

    this.titulo = '';
    this.contenido = '';
    await this.cargarNoticias();
  }
}
