import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../Services/global.service';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { StripeService, StripeCardComponent } from "ngx-stripe";
import {
  StripeCardElementOptions,
  StripeElementsOptions
} from "@stripe/stripe-js";
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  @ViewChild('myModal') myModal: any;
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  stripeName: string = "";

  bookingData: any
  tab1: boolean = true;
  tab2: boolean = false;
  tab3: boolean = false;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  contact?: string;
  additionalInfo?: string;
  creditCard?: boolean = false;
  creditCardNumber?: string;
  paypal?: boolean = false;
  stripe?: boolean = false;
  status: string = "Pending";
  model!: NgbDateStruct;
  closeResult = '';

  action: boolean = true;
  setAutoHide: boolean = true;
  autoHide: number = 2000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  addExtraClass: boolean = true;

  public payPalConfig?: IPayPalConfig;
  totalBilling: string = '0';
  showPaymentDailog: boolean = false;

  elementsOptions: StripeElementsOptions = {
    locale: "en"
  };

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: "40px",
        fontWeight: "300",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "18px",
        "::placeholder": { color: "#CFD7E0" }
      }
    }
  };

  constructor(
    private spinner: NgxSpinnerService,
    public router: Router,
    public global: GlobalService,
    private stripeService: StripeService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initConfig();
    var bookingData: any = localStorage.getItem('bookingData');
    this.bookingData = JSON.parse(bookingData)
    console.log(this.bookingData)
  }

  selectCreditCard() {
    this.creditCard = true;
    this.paypal = false
    this.stripe = false
  }

  selectPaypal() {
    this.creditCard = false;
    this.paypal = true;
    this.stripe = false;
  }
  selectStripe() {
    this.creditCard = false;
    this.paypal = false;
    this.stripe = true;
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

  PaymentProcess(content?: any) {
    this.finalizeData();

    if (this.paypal) {
      this.open(content);
    }
    else if (this.stripe) {
      this.stripePayment();
    }
    else {
      this.spinner.show()
      this.finalizeBooking();
    }
  }

  finalizeBooking() {
    console.log(JSON.stringify(this.bookingData, undefined, 2))
    this.global.postBookingData(this.bookingData).subscribe(
      (data) => {
        this.spinner.hide()
        this.openSnackBar("Thanks For Booking, Your Spot Has Been Fixed From " + this.bookingData.dateFrom + " to " + this.bookingData.dateTo + " !", "success")
        setTimeout(() => {
          this.router.navigate(["/"])
        }, 4200);
        console.log(data)
      }, (err) => {
        this.spinner.hide()
        this.openSnackBar("Error ! Your Booking Cannot Be Confirmed At the moment. Please Try Again Later.", "danger")
        console.log(err)
      }
    )
  }

  finalizeData() {
    var totalBilling = this.bookingData.person_qty * this.bookingData.price_per_person + this.bookingData.boat.boat_qty * this.bookingData.boat.boat_price_per_person
    this.totalBilling = totalBilling.toString()

    this.bookingData.firstName = this.firstName
    this.bookingData.lastName = this.lastName
    this.bookingData.number = this.phoneNumber
    this.bookingData.address = this.address
    this.bookingData.email = this.email
    this.bookingData.contact = this.contact
    this.bookingData.additionalInfo = this.additionalInfo
    if (this.creditCard) {
      this.bookingData.creditCard = true
      this.bookingData.creditCardNumber = this.creditCardNumber
    }
    else if (this.paypal) {
      this.bookingData.paypal = true
    }
    else if (this.stripe) {
      this.bookingData.stripe = true
    }
    else {
      this.bookingData.creditCard = true
      this.bookingData.creditCardNumber = this.creditCardNumber
    }
    this.bookingData.status = "Confirmed"
  }

  openSnackBar(message: any, action?: string) {
    this.global.openSnackBar(message, action)
  }

  private initConfig(): void {
    this.payPalConfig = {
      clientId: "27oJa8EVZwqIYeaW-Je2it8H8VxDtTXs1bTLISChtWiwJ_AgmM0eH6pPEh9dbjsZfCRJW",
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: this.totalBilling,
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: this.totalBilling
                  }
                }
              },
              items: [
                {
                  name: "Booking For Marina Spot",
                  quantity: '1',
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: "USD",
                    value: this.totalBilling
                  }
                }
              ]
            }
          ]
        },
      advanced: {
        commit: "true"
      },
      style: {
        label: "paypal",
        layout: "vertical"
      },
      onApprove: (data, actions) => {
        console.log(
          "onApprove - transaction was approved, but not authorized",
          data,
          actions
        );
        actions.order.get().then((details: any) => {
          console.log(
            "onApprove - you can get full order details inside onApprove: ",
            details
          );
          // Uncomment this line before testing payment method and moving for deployment.
          // this.finalizeBooking()
        });
      },
      onClientAuthorization: data => {
        console.log(
          "onClientAuthorization - you should probably inform your server about completed transaction at this point",
          data
        );
      },
      onCancel: (data, actions) => {
        console.log("OnCancel", data, actions);
      },
      onError: err => {
        console.log("OnError", err);
      },
      onClick: (data, actions) => {
        console.log("onClick", data, actions);
      }
    };
  }

  open(content: any) {
    this.showPaymentDailog = true;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  stripePayment(): void {
    var name: any = this.firstName
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        if (result.token) {
          // Use the token
          console.log(result.token.id);
          this.finalizeBooking();
        } else if (result.error) {
          // Error creating the token
          console.log(result.error.message);
          this.openSnackBar(result.error.message, "danger")
        }
      });
  }
}
