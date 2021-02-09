import { Component, OnInit, OnDestroy } from '@angular/core';

import { EMPTY, Subject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productWithCategory$.pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  selectedProduct$ = this.productService.selectedProduct$;
  sub: Subscription;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChange(productId);
  }
}
