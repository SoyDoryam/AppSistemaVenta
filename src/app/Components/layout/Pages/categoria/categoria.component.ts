import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

// ? 1 importaciones
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { ModalCategoriaComponent } from '../../Modales/modal-categoria/modal-categoria.component';
import { Categoria } from 'src/app/Interfaces/categoria';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit, AfterViewInit {


    // ? 2 declaracion de variable 
    columnasTabla : string [] = ['nombre','estado', 'acciones'];
    dataInicio: Categoria[] = [];
    dataListaCategorias= new MatTableDataSource(this.dataInicio);
    @ViewChild(MatPaginator) paginacionTabla! : MatPaginator;

  // ? 3 contructor
    constructor(
      private dialog: MatDialog,
      private _categoriaServicio: CategoriaService,
      private _utilidadServicio: UtilidadService,
    ) { }

    // ? 4 obtener datos de la tabla 
  obtenerCategorias(){
    this._categoriaServicio.lista().subscribe({
      next: (data) => {
        if(data.status){
          this.dataListaCategorias.data = data.value;
          console.log(this.dataListaCategorias)
        }else{
          this._utilidadServicio.mostrarAlerta('No se encontraron datos','Opps!');
        }
      },
      error: (e) =>{console.log(e)}
    }) 
  }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  ngAfterViewInit(): void {
    this.dataListaCategorias.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaCategorias.filter = filterValue.trim().toLocaleLowerCase();
  }

    nuevaCategoria(){
      this.dialog.open(ModalCategoriaComponent,{
        disableClose: true,
      }).afterClosed().subscribe(resultado => {
        if(resultado == "true"){
            this.obtenerCategorias();
        }
      });
    }

    editarCategoria(categoria: CategoriaComponent){
          this.dialog.open(ModalCategoriaComponent, {
            disableClose: true,
            data: categoria,
          }).afterClosed().subscribe(resultado => {
            if(resultado == "true"){
              this.obtenerCategorias();
            }
          });
        }
    
eliminarCategoria(categoria:Categoria){
      
      console.log(categoria);
      Swal.fire({
        title: '¿Desea eliminar el categoria?',
        text: categoria.nombre,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Si, Eliminar',
        showCancelButton: true,
        cancelButtonColor: '#d33',
        cancelButtonText: 'No, volver'
      }).then((resultdao) => {
        if(resultdao.isConfirmed){
          this._categoriaServicio.eliminar(categoria.idCategoria).subscribe({
            next: (data)=>{
              if(data.status){
                this._utilidadServicio.mostrarAlerta('El categoria fue eliminado', 'Listo!');
                this.obtenerCategorias();
              }else{
                this._utilidadServicio.mostrarAlerta('No se pudo eliminar el categoria', 'Error');
              }
            },
            error: (e) =>{console.log(e);}
          });
        }
      })
      
    }
}
