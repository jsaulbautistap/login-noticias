import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { supabase } from 'src/app/supabase.client';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  email = '';
  nombreUsuario = '';
  imagenPerfil = '';
  titulo = '';
  contenido = '';
  noticias: any[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.email = user.email || '';

    // Obtener nombre e imagen del perfil del usuario
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nombre, fotoPerfil')
      .eq('id', user.id)
      .single();

    if (perfil) {
      this.nombreUsuario = perfil.nombre;
      this.imagenPerfil = perfil.fotoPerfil;
    }

    await this.cargarNoticias();
  }

  async publicarNoticia() {
    if (!this.titulo.trim() || !this.contenido.trim()) return;

    const { error } = await supabase.from('noticias').insert({
      titulo: this.titulo,
      contenido: this.contenido,
      nombre_usuario: this.nombreUsuario,
      imagen_perfil: this.imagenPerfil,
      email: this.email,
    });

    if (!error) {
      this.titulo = '';
      this.contenido = '';
      await this.cargarNoticias();
    }
  }

  async cargarNoticias() {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      this.noticias = data || [];
    }
  }

  async logout() {
    await supabase.auth.signOut();
    this.router.navigate(['/auth']);
  }
}
