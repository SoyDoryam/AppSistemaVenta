import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

// ? 1 importaciones
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';
import { Producto } from 'src/app/Interfaces/producto';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
import { utc } from 'moment';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, AfterViewInit {

  // ? 2 declaracion de variable 
  
  columnasTabla : string [] = ['nombre','categoria','stock','precio', 'estado', 'acciones'];
  dataInicio: Producto[] = [];
  dataListaProductos = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator;

  // ? 3 contructor
  constructor(
    private dialog: MatDialog,
    private _productoServicio: ProductoService,
    private _utilidadServicio: UtilidadService,
  ) { }

  // ? 4 obtener datos de la tabla 
  obtenerProductos(){
    this._productoServicio.lista().subscribe({
      next: (data) => {
        if(data.status){
          this.dataListaProductos.data = data.value;
        }else{
          this._utilidadServicio.mostrarAlerta('No se encontraron datos','Opps!');
        }
      },
      error: (e) =>{console.log(e)}
    }) 
  }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  ngAfterViewInit(): void {
    this.dataListaProductos.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaProductos.filter = filterValue.trim().toLocaleLowerCase();
  }

  nuevoProducto(){
    this.dialog.open(ModalProductoComponent,{
      disableClose: true,
    }).afterClosed().subscribe(resultado => {
      if(resultado == "true"){
          this.obtenerProductos();
      }
    });
  }

  editarProducto(producto: Producto){
      this.dialog.open(ModalProductoComponent, {
        disableClose: true,
        data: producto,
      }).afterClosed().subscribe(resultado => {
        if(resultado == "true"){
          this.obtenerProductos();
        }
      });
    }

   eliminarProducto(producto:Producto){
      
      console.log(producto);
      Swal.fire({
        title: '¿Desea eliminar el producto?',
        text: producto.nombre,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Si, Eliminar',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        cancelButtonText: 'No, volver'
      }).then((resultdao) => {
        if(resultdao.isConfirmed){
          this._productoServicio.eliminar(producto.idProducto).subscribe({
            next: (data)=>{
              if(data.status){
                this._utilidadServicio.mostrarAlerta('El usuario fue eliminado', 'Listo!');
                this.obtenerProductos();
              }else{
                this._utilidadServicio.mostrarAlerta('No se pudo eliminar el usuario', 'Error');
              }
            },
            error: (e) =>{console.log(e);}
          });
        }
      })
      
    }

}
