import { Component, OnInit, Inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators} from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// ? 1 importaciones 
import { Categoria } from 'src/app/Interfaces/categoria';
import { Producto } from 'src/app/Interfaces/producto';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.css']
})
export class ModalProductoComponent implements OnInit {

  // ? 2 Creacion de las variables
  formularioProducto: FormGroup;
  tituloAccion: string = 'Agregar';
  botonAccion: string = 'Guardar';
  ListarCategoria: Categoria[] = [];

  // ? 3 constructor 
  constructor(
    private modalActual: MatDialogRef<ModalProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosProducto: Producto,
    private fb: FormBuilder,
    private _categoriaService: CategoriaService,
    private _productoService: ProductoService,
    private _utilidadService: UtilidadService
  ) { 
    // ? 4 creacion de formulario
    this.formularioProducto = this.fb.group({
      nombre: ["", Validators.required],
      idCategoria: ["", Validators.required],
      stock: ["", Validators.required],
      precio: ["", Validators.required],
      esActivo: [1, Validators.required]
    })

    // ? 5 validacion de datos de producto 
    if(this.datosProducto != null){
      this.tituloAccion = 'Editar';
      this.botonAccion = 'Actualizar'
    }

    // ? 6 lista de categoria
    this._categoriaService.lista().subscribe({
      next:(data) =>{
        if(data != null)(this.ListarCategoria = data.value)
      },
      error: (e) => {console.log(e)}
    });

  }

  ngOnInit(): void {
    // ? 7 validacion de datos de producto
    if(this.datosProducto != null){
      this.formularioProducto.patchValue({
        nombre: this.datosProducto.nombre,
        idCategoria: this.datosProducto.idCategoria,
        stock: this.datosProducto.stock,
        precio: this.datosProducto.precio,
        esActivo: this.datosProducto.esActivo.toString()
      })
    }
  }

  // ? 8 guardar o editar producto
  guardarEditar_Producto(){
    const _producto: Producto = {
      idProducto: this.datosProducto == null ? 0 : this.datosProducto.idProducto,
      nombre: this.formularioProducto.value.nombre,
      idCategoria: this.formularioProducto.value.idCategoria,
      descripcionCategoria: "",
      stock: this.formularioProducto.value.stock,
      precio: this.formularioProducto.value.precio,
      esActivo: parseInt(this.formularioProducto.value.esActivo)
    }
    console.log(_producto);
    console.log(_producto.esActivo);

    if(this.datosProducto == null){
      this._productoService.guardar(_producto).subscribe({
        next:(data) =>{
          if(data.status){
            this._utilidadService.mostrarAlerta('EL producto fue registrado', 'Exito');
            this.modalActual.close("true");
          }else{
            this._utilidadService.mostrarAlerta('No se pudo editar producto','Error')
          }
        },
        error: (error) => {console.log(error)}
      })
    }else{
        this._productoService.editar(_producto).subscribe({
          next: (data) =>{
            if(data.status){
              this._utilidadService.mostrarAlerta('El producto fue Editado', 'Exito');
              this.modalActual.close("true");
            }else{
              this._utilidadService.mostrarAlerta('No se pudo editar el producto', 'Error');
            }
          },
          error: (e)=> {}
        });
    }
  }

}
