import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../Services/global.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  fileName = 'Marina-Spot-Booking-Data.xlsx';
  bookingData: any;
  productData: any;
  totalRevenue: number = 0;
  totalProfit: number = 0;
  constructor(public global: GlobalService, public router: Router) { }

  ngOnInit(): void {
    // Check if Admin Login Is True
    if (this.global.isLogin == false || this.global.isLogin == undefined) {
      if (JSON.parse(localStorage.getItem("isLogin") || "") != true || JSON.parse(localStorage.getItem("isLogin") || "") == undefined) {
        // if not route to login page
        this.router.navigate(["/login"])
        // console.log(this.global.isLogin)
      }
      else {
        // else get data for all order using GET API
        this.global.isLogin = true;
        this.global.getBookingData().subscribe(
          (data) => {
            this.bookingData = data
            for (var i = 0; i < this.bookingData.length; i++) {
              // We loop through data of all order and calculate total Revenue by adding cost paid by user
              this.totalRevenue = this.totalRevenue + Number(1 * this.bookingData[i].marina_price + 1 * this.bookingData[i].boat.boat_price)
              // We loop through data and calculate profit. Profit percentage is set to 30% hardcoded
              // 30% Profit = 0.3 Below--------------|
              this.totalProfit = this.totalProfit + 0.3 * Number(1 * this.bookingData[i].marina_price + 1 * this.bookingData[i].boat.boat_price)
            }
          }
        )
      }
    }
    else {
      this.global.getBookingData().subscribe(
        (data) => {
          // console.log(data)
          this.bookingData = data
          this.calculateAmounts()
        }
      )
    }
  }

  deleteBooking(id: any, index: any) {
    // We receive Order Object I Here. Just we add it to delete API and hit it. Order is deleted
    // console.log("ID : ", id)
    this.global.deleteBooking(id).subscribe(
      data => {
        // console.log(data)
        this.bookingData.splice(index, 1)
        this.calculateAmounts()
        this.global.openSnackBar("Booking Deleted Successfully !", "success")
      },
      err => {
        // console.log(err)
        this.global.openSnackBar(err, "danger")
      }, () => {
        this.bookingData.splice(index, 1)
      }
    )
  }

  calculateAmounts() {
    this.totalRevenue = 0;
    this.totalProfit = 0;
    for (var i = 0; i < this.bookingData.length; i++) {
      // We loop through data of all order and calculate total Revenue by adding cost paid by user
      this.totalRevenue = this.totalRevenue + Number(1 * this.bookingData[i].marina_price + 1 * this.bookingData[i].boat.boat_price)
      // We loop through data and calculate profit. Profit percentage is set to 30% hardcoded
      // 30% Profit = 0.3 Below--------------|
      this.totalProfit = this.totalProfit + 0.3 * Number(1 * this.bookingData[i].marina_price + 1 * this.bookingData[i].boat.boat_price)
    }
  }

  exportexcel(): void {
    // Data Exporting to Excel Function
    // in Template we have add id='excel-table' to our order table
    // so that this function can capture the entrie in table and convert it to excel 

    /* table id is passed over here */
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

}
