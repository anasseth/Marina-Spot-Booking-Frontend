import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment'
import {
    MatSnackBar,
    MatSnackBarConfig,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    passObject: any;
    isLogin?: boolean;
    headers = new HttpHeaders().set('Content-Type', 'application/json');
    action: boolean = true;
    setAutoHide: boolean = true;
    autoHide: number = 2000;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';
    addExtraClass: boolean = true;

    constructor(private http: HttpClient, public snackBar: MatSnackBar) { }

    postBookingData(Data: any): Observable<any> {
        return this.http.post<any>(environment.apiURL + 'booking/', Data).pipe(catchError(this.error))
    }
    getIDpass(): Observable<any> {
        return this.http.get<any>(environment.apiURL + 'password/').pipe(catchError(this.error))
    }
    getBookingData(): Observable<any> {
        return this.http.get<any>(environment.apiURL + 'booking/').pipe(catchError(this.error))
    }
    getProductData(): Observable<any> {
        return this.http.get<any>(environment.apiURL + 'products/').pipe(catchError(this.error))
    }
    deleteBooking(id: any) {
        return this.http.delete<any>(environment.apiURL + 'booking/' + id).pipe(catchError(this.error))
    }
    updatePassword2(obj: any) {
        return this.http.put<any>(environment.apiURL + 'password/' + this.passObject.id, obj).pipe(catchError(this.error))
    }
    updatePassword(obj: any) {
        var passObject: any;
        console.log(obj)
        this.getIDpass().subscribe(
            (data) => {
                this.passObject = data[0]
            }, (err) => {
                console.log(err)
            }, () => {
                if (obj.password == this.passObject.password) {
                    obj.password = obj.newpassword;
                    obj.name = this.passObject.name
                    delete obj.newpassword;
                    console.log(obj)
                    console.log(this.passObject)
                    this.updatePassword2(obj).subscribe(
                        (data) => {
                            console.log(data)
                            alert("Password Updated Successfully")
                        }, (err) => {
                            console.log(err)
                        }
                    )
                }
                else {
                    alert("Old Password is Incorrect")
                    return;
                }
            }
        )

    }

    error(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(errorMessage);
        return throwError(errorMessage);
    }

    openSnackBar(message: string, action?: string) {
        var snackBarType = action == "success" ? "success" : "danger"
        this.snackBar.open(message, undefined, {
            duration: 4000,
            verticalPosition: this.verticalPosition,
            horizontalPosition: this.horizontalPosition,
            panelClass: snackBarType,
        });
    }

}
