import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service'

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(products =>
        // products.map( product => ({
        //   id: product.id,
        //   productName: product.productName,
        //   productCode: product.productCode,
        //   description: product.description,
        //   price: product.price * 1.5,
        //   categoryId: product.categoryId,
        //   quantityInStock: product.quantityInStock,
        //   searchKey: [product.productName],
        //   supplierIds: product.supplierIds
        // }) as Product)
        products.map(product => ({
          ...product,
          price: product.price + 1.5,
          searchKey: [product.productName]
        }) as Product)
      ),
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

  productWithCategory$ = combineLatest([
    this.products$,
    this.productCategory.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(c => product.categoryId == c.id).name,
        searchKey: [product.productName]
      }) as Product)
    )
  );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productWithCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('selected product', product))
  );

  constructor(
    private http: HttpClient,
    private productCategory: ProductCategoryService
  ) { }

  selectedProductChange(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
