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
    console.log(this.global.isLogin)
    if (this.global.isLogin == false || this.global.isLogin == undefined) {
      if (JSON.parse(localStorage.getItem("isLogin") || "") != true || JSON.parse(localStorage.getItem("isLogin") || "") == undefined) {
        this.router.navigate(["/login"])
        console.log(this.global.isLogin)
      }
      else {
        this.global.isLogin = true;
        this.global.getBookingData().subscribe(
          (data) => {
            console.log(data)
            this.bookingData = data
            for (var i = 0; i < this.bookingData.length; i++) {
              this.totalRevenue = this.totalRevenue + Number(this.bookingData[i].person_qty * this.bookingData[i].price_per_person + this.bookingData[i].boat.boat_qty * this.bookingData[i].boat.boat_price_per_person)
              this.totalProfit = this.totalProfit + 0.3 * Number(this.bookingData[i].person_qty * this.bookingData[i].price_per_person + this.bookingData[i].boat.boat_qty * this.bookingData[i].boat.boat_price_per_person)
            }
          }
        )
      }
    }
    else {
      this.global.getBookingData().subscribe(
        (data) => {
          console.log(data)
          this.bookingData = data
          this.calculateAmounts()
        }
      )
    }
  }

  deleteBooking(id: any, index: any) {
    console.log("ID : ", id)
    this.global.deleteBooking(id).subscribe(
      data => {
        console.log(data)
        this.bookingData.splice(index, 1)
        this.calculateAmounts()
      },
      err => {
        console.log(err)
      }, () => {
        this.bookingData.splice(index, 1)
      }
    )
  }

  calculateAmounts() {
    this.totalRevenue = 0;
    this.totalProfit = 0;
    for (var i = 0; i < this.bookingData.length; i++) {
      this.totalRevenue = this.totalRevenue + Number(this.bookingData[i].person_qty * this.bookingData[i].price_per_person + this.bookingData[i].boat.boat_qty * this.bookingData[i].boat.boat_price_per_person)
      this.totalProfit = this.totalProfit + 0.3 * Number(this.bookingData[i].person_qty * this.bookingData[i].price_per_person + this.bookingData[i].boat.boat_qty * this.bookingData[i].boat.boat_price_per_person)
    }
  }

  exportexcel(): void {
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
