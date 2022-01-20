import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../Services/global.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  bookingData: any
  tab1: boolean = true;
  tab2: boolean = false;
  tab3: boolean = false;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  creditCard?: boolean;
  creditCardNumber?: string;
  paypal?: boolean;
  status: string = "Pending";
  model!: NgbDateStruct;

  constructor(public router: Router, public global: GlobalService) { }

  ngOnInit(): void {
    var bookingData: any = localStorage.getItem('bookingData');
    this.bookingData = JSON.parse(bookingData)
    console.log(this.bookingData)
  }

  selectCreditCard() {
    this.creditCard = true;
    this.paypal = false
  }

  selectPaypal() {
    this.creditCard = false;
    this.paypal = true;
  }

  switchTab() {
    if (this.tab1 == true) {
      this.tab2 = true;
      this.tab1 = false;
      this.tab3 = false;
    }
    else if (this.tab2 == true) {
      this.tab2 = false;
      this.tab1 = false;
      this.tab3 = true;
    }
  }

  finishBooking() {
    this.bookingData.firstName = this.firstName
    this.bookingData.lastName = this.lastName
    this.bookingData.number = this.phoneNumber
    this.bookingData.address = this.address
    this.bookingData.email = this.email
    if (this.creditCard) {
      this.bookingData.creditCard = true
      this.bookingData.creditCardNumber = this.creditCardNumber
    }
    else {
      this.bookingData.paypal = true
    }
    this.bookingData.status = "Confirmed"
    console.log(JSON.stringify(this.bookingData, undefined, 2))

    this.global.postBookingData(this.bookingData).subscribe(
      (data) => {
        console.log(data)
      }, (err) => {
        console.log(err)
      }
    )

    console.log(this.bookingData)
    alert("Thanks For Booking, Your Spot Has Been Fixed From " + this.bookingData.dateFrom + " to " + this.bookingData.dateTo + " !")
    this.router.navigate(["/"])
  }

}
