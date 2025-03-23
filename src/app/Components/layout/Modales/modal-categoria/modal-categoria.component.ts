import { Component, OnInit, Inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators} from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// ? 1 importaciones 
import { Categoria } from 'src/app/Interfaces/categoria';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-categoria',
  templateUrl: './modal-categoria.component.html',
  styleUrls: ['./modal-categoria.component.css']
})
export class ModalCategoriaComponent implements OnInit {

    // ? 2 Creacion de las variables
    formularioCategoria: FormGroup;
    tituloAccion: string = 'Agregar';
    botonAccion: string = 'Guardar';

  // ? 3 constructor 
  constructor(
        private modalActual: MatDialogRef<ModalCategoriaComponent>,
        @Inject(MAT_DIALOG_DATA) public datosCategoria: Categoria,
        private fb: FormBuilder,
        private _categoriaService: CategoriaService,
        private _utilidadService: UtilidadService
  ) { 
     // ? 4 creacion de formulario
     this.formularioCategoria = this.fb.group({
      nombre: ["", Validators.required],
      esActivo: [1, Validators.required]
    })

     // ? 5 validacion de datos de producto 
     if(this.datosCategoria != null){
      this.tituloAccion = 'Editar';
      this.botonAccion = 'Actualizar'
    }
  }

  ngOnInit(): void {
     // ? 7 validacion de datos de categoria
     if(this.datosCategoria != null){
      this.formularioCategoria.patchValue({
        nombre: this.datosCategoria.nombre,
        esActivo: this.datosCategoria.esActivo.toString()
      });
    }
  }

    // ? 8 guardar o editar producto
    guardarEditar_Categoria(){
        const _categoria: Categoria = {
          idCategoria: this.datosCategoria == null ? 0 : this.datosCategoria.idCategoria,
          nombre: this.formularioCategoria.value.nombre,
          esActivo: parseInt(this.formularioCategoria.value.esActivo)
        }
        console.log(_categoria);
        console.log(_categoria.esActivo);
    
        if(this.datosCategoria == null){
          this._categoriaService.guardar(_categoria).subscribe({
            next:(data) =>{
              if(data.status){
                this._utilidadService.mostrarAlerta('EL categoria fue registrado', 'Exito');
                this.modalActual.close("true");
              }else{
                this._utilidadService.mostrarAlerta('No se pudo editar categoria','Error')
              }
            },
            error: (error) => {console.log(error)}
          })
        }else{
            this._categoriaService.editar(_categoria).subscribe({
              next: (data) =>{
                if(data.status){
                  this._utilidadService.mostrarAlerta('El categoria fue Editado', 'Exito');
                  this.modalActual.close("true");
                }else{
                  this._utilidadService.mostrarAlerta('No se pudo editar el categoria', 'Error');
                }
              },
              error: (e)=> {}
            });
        }
  }
}

