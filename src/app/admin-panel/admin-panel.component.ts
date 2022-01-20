import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../Services/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  bookingData: any;
  productData: any;
  totalRevenue: number = 0;
  totalProfit: number = 0;
  constructor(public global: GlobalService, public router: Router) { }

  ngOnInit(): void {
    console.log(this.global.isLogin)
    if (this.global.isLogin == false || this.global.isLogin == undefined) {
      this.router.navigate(["/login"])
      console.log(this.global.isLogin)
    }
    else {
      this.global.getBookingData().subscribe(
        (data) => {
          console.log(data)
          this.bookingData = data
          for (var i = 0; i < this.bookingData.length; i++) {
            this.totalRevenue = this.totalRevenue + Number( this.bookingData[i].person_qty * this.bookingData[i].price_per_person +this.bookingData[i].boat.boat_qty * this.bookingData[i].boat.boat_price_per_person )
            this.totalProfit = this.totalProfit + 0.3 * Number( this.bookingData[i].person_qty * this.bookingData[i].price_per_person +this.bookingData[i].boat.boat_qty * this.bookingData[i].boat.boat_price_per_person )
          }
        }
      )
    }
  }

  deleteBooking(id: any, index: any) {
    console.log("ID : ", id)
    this.global.deleteBooking(id).subscribe(
      data => {
        console.log(data)
      },
      err => {
        console.log(err)
      }, () => {
        this.bookingData.splice(index, 1)
      }
    )
  }

}
