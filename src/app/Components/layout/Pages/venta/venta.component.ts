import { Component, OnInit } from '@angular/core';

// ? 1 importaciones
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { MatTableDataSource } from '@angular/material/table';

import { ProductoService } from 'src/app/Services/producto.service';
import { VentaService } from 'src/app/Services/venta.service'; 
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

import { Producto } from 'src/app/Interfaces/producto';
import { Venta } from 'src/app/Interfaces/venta';
import { DetalleVenta } from 'src/app/Interfaces/detalle-venta';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})

export class VentaComponent implements OnInit {
  
  // ? 2 Creación de variables 
  listaProductos: Producto[] = [];
  listaProductoFiltro: Producto[] = [];
  
  listaProductosParaVenta: DetalleVenta[] = [];
  bloquearBotonRegistrar: boolean = false;

  productoSeleccionado!: Producto;
  tipoPagoPorDefecto: string = "Efectivo";
  totalPagar: number = 0;
  
  formularioProductoVenta: FormGroup;
  columnasTabla: string[] = ["producto", "cantidad", "precio", "total", "accion"];
  datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);
  
  retornarProductosPorFiltro(busqueda: any): Producto[] {
    const valorBuscado = typeof busqueda === "string" ? busqueda.toLocaleLowerCase() : busqueda.nombre.toLocaleLowerCase();
    return this.listaProductos.filter(item => item.nombre.toLocaleLowerCase().includes(valorBuscado));
  }

  // ? 3 Constructor
  constructor(
    private fb: FormBuilder,
    private _productoServicio: ProductoService,
    private _ventaService: VentaService,
    private _utilidadService: UtilidadService
  ) { 
    // * Creamos campo para nuestro formulario de producto
    this.formularioProductoVenta = this.fb.group({
      producto: ['', Validators.required],
      cantidad: ['', Validators.required] // Validar que la cantidad sea mayor que 0
    });

    this._productoServicio.lista().subscribe({
      next: (data) => {
        if(data.status) {
          const lista = data.value as Producto[];
          this.listaProductos = lista.filter(p => p.esActivo == 1 && p.stock > 0);
        }
      },
      error: (e) => {}
    });

    // * Lista de productos que se desea buscar
    this.formularioProductoVenta.get('producto')?.valueChanges.subscribe(value => {
      this.listaProductoFiltro = this.retornarProductosPorFiltro(value);
    });
  }

  ngOnInit(): void {
  }

  // * Creación de evento para mostrar el producto que se ha seleccionado por medio del campo de búsqueda
  mostrarProducto(producto: Producto): string {
    return producto.nombre;
  }

  // * Crear evento para guardar temporalmente el producto seleccionado
  productoParaVenta(event: any) {
    this.productoSeleccionado = event.option.value;
  }

  // * Crear método para agregar el producto elegido y registrar la venta
  agregarProductoParaVenta() {
    const _cantidad: number = this.formularioProductoVenta.value.cantidad;
    const _precio: number = parseFloat(this.productoSeleccionado.precio); 
    const _total: number = _cantidad * _precio;
    this.totalPagar = this.totalPagar + _total;

    this.listaProductosParaVenta.push({
      idProducto: this.productoSeleccionado.idProducto,
      descripcionProducto: this.productoSeleccionado.nombre,
      cantidad: _cantidad,
      precioTexto: String(_precio.toFixed(2)),
      totalTexto: String(_total.toFixed(2)),
    });

    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);
    console.log(this.datosDetalleVenta);

    this.formularioProductoVenta.patchValue({
      producto: "",
      cantidad: ""
    });
  }

  // * Eliminar producto de la venta
  eliminarProducto(detalle: DetalleVenta) {
    this.totalPagar = this.totalPagar - parseFloat(detalle.totalTexto);
    this.listaProductosParaVenta = this.listaProductosParaVenta.filter(p => p.idProducto !== detalle.idProducto);
    this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);
  }

  // * Método para registrar la venta
  registrarVenta() {
    if (this.listaProductosParaVenta.length > 0) {
      this.bloquearBotonRegistrar = true;

      const request: Venta = {
        tipoPago: this.tipoPagoPorDefecto,
        totalTexto: String(this.totalPagar.toFixed(2)),
        detalleVenta: this.listaProductosParaVenta
      };
      
      console.log('Solicitud de venta:', request);      
      
      this._ventaService.registrar(request).subscribe({
        next: (response) => {
          if (response.status) {
            this.totalPagar = 0.00;
            this.listaProductosParaVenta = [];
            this.datosDetalleVenta = new MatTableDataSource(this.listaProductosParaVenta);

            Swal.fire({
              icon: 'success',
              title: '¡Venta registrada!',
              text: `Número de venta: ${response.value.numeroDocumento}`
            });
          } else {
            this._utilidadService.mostrarAlerta('No se pudo registrar la venta', "Oops");
          }
        },
        complete: () => {
          this.bloquearBotonRegistrar = false; 
        },
        error: (e) => {
          console.log(e);
          this._utilidadService.mostrarAlerta('Hubo un error al registrar la venta.', "Error");
        },
      });
    }
  }
}